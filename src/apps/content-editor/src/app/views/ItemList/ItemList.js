import React, { useRef, useState, useEffect, PureComponent } from "react";
import { connect } from "react-redux";
import { VariableSizeList as List } from "react-window";
import { useHistory } from "react-router-dom";
import isEqual from "lodash/isEqual";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Button } from "@zesty-io/core/Button";

import { SetActions } from "./SetActions";
import { SetColumns } from "./SetColumns";
import { SetRow } from "./SetRow";

import { DragScroll } from "../../components/DragScroll";
import { PendingEditsModal } from "../../components/PendingEditsModal";
import { NotFound } from "shell/components/NotFound";

import {
  fetchItem,
  fetchItems,
  searchItems,
  saveItem
} from "shell/store/content";
import { fetchFields } from "shell/store/fields";
import { notify } from "shell/store/notifications";
import { findFields, findItems } from "./findUtils";

import styles from "./ItemList.less";

const PAGE_SIZE = 5000;
const DEFAULT_FILTER = {
  sortedBy: null,
  reverseSort: false,
  status: "all",
  filterTerm: "",
  colType: null
};

export default connect((state, props) => {
  const { modelZUID } = props.match.params;
  const model = state.models[modelZUID];

  const selectedLang = state.languages
    ? state.languages.find(lang => lang.code === state.user.selected_lang) || {}
    : {};

  const userSelectedLang = state.user.selected_lang;

  return {
    selectedLang,
    userSelectedLang,
    model,
    modelZUID,
    user: state.user,
    filters: state.listFilters,
    instance: state.instance,
    allItems: state.content,
    allFields: state.fields,
    dirtyItems: Object.keys(state.content).filter(
      item =>
        state.content[item].meta &&
        state.content[item].meta.contentModelZUID === modelZUID &&
        state.content[item].dirty &&
        state.content[item].meta.ZUID.slice(0, 3) !== "new" // Don't include new items
    )
  };
})(function ItemList(props) {
  const history = useHistory();
  const _isMounted = useRef(false);

  // table, list dimensions
  const table = useRef();
  const list = useRef();
  const [height, setHeight] = useState(1000);
  const [width, setWidth] = useState(1000);

  // saving, loading states
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [fields, setFields] = useState([]);
  const [filter, setFilter] = useState(
    props.filters[props.modelZUID]
      ? props.filters[props.modelZUID]
      : DEFAULT_FILTER
  );

  // Used to runFilters/updateItemCount on *next* render
  // we use these since otherwise executing those functions directly
  // would lead to stale props/state. executing on *next* render
  // guarantees latest props/state
  // e.g. setShouldRunFilters(true) -> *next render* -> runFilters()
  const [shouldRunFilters, setShouldRunFilters] = useState(false);
  const [shouldUpdateItemCount, setShouldUpdateItemCount] = useState(false);

  // track isMounted
  useEffect(() => {
    _isMounted.current = true;
    return () => {
      _isMounted.current = false;
    };
  }, []);

  // redirect to single entry
  useEffect(() => {
    if (
      props.model &&
      (props.model.name === "clippings" || props.model.type === "templateset")
    ) {
      // First item is always the column row
      if (items.length === 2) {
        // redirect to the single entry in content clippings
        history.push(`/content/${props.modelZUID}/${items[1].meta.ZUID}`);
      }
    }
  }, [props.modelZUID]);

  // on initial and
  // on modelZUID change
  // update filter and load fields/items
  useEffect(() => {
    setFilter(
      props.filters[props.modelZUID]
        ? props.filters[props.modelZUID]
        : DEFAULT_FILTER
    );
    load(props.modelZUID, props.userSelectedLang);
  }, [props.modelZUID, props.userSelectedLang]);

  // on filter change
  // run and persist filters
  useEffect(() => {
    if (_isMounted.current) {
      runFilters();
      persistFilters();
    }
  }, [filter, props.selectedLang]);

  useEffect(() => {
    if (_isMounted.current && shouldRunFilters) {
      runFilters();
      setShouldRunFilters(false);
    }
  }, [shouldRunFilters]);

  useEffect(() => {
    if (_isMounted.current && shouldUpdateItemCount) {
      updateItemCount();
      setShouldUpdateItemCount(false);
    }
  }, [shouldUpdateItemCount]);

  // on items update, update itemCount
  useEffect(() => {
    setItemCount(Math.max(0, items.length - 1));
  }, [items]);

  // set table dimensions, re-check on props change
  useEffect(() => {
    if (
      table.current &&
      (height !== table.current.clientHeight ||
        width !== table.current.clientWidth)
    ) {
      setHeight(table.current.clientHeight);
      setWidth(table.current.clientWidth);
    }
  }, [props]);

  function updateItemsAndFields() {
    const newFields = findFields(props.allFields, props.modelZUID);
    const newItems = findItems(
      props.allItems,
      props.modelZUID,
      props.selectedLang.ID
    );

    newItems.unshift(newFields);
    setFields(newFields);
    setItems(newItems);
  }

  async function load(modelZUID, lang) {
    setInitialLoading(true);
    setBackgroundLoading(true);

    try {
      const [, itemsRes] = await Promise.all([
        props.dispatch(fetchFields(modelZUID)),
        props.dispatch(
          fetchItems(modelZUID, {
            limit: PAGE_SIZE,
            page: 1,
            lang
          })
        )
      ]);
      if (_isMounted.current) {
        // render 1st page of results
        setShouldRunFilters(true);
        setInitialLoading(false);

        if (itemsRes._meta.totalResults === PAGE_SIZE) {
          // load page 2 until last page
          await crawlFetchItems(modelZUID, lang);
          // re-render after all pages fetched
          setShouldRunFilters(true);
        }
        setBackgroundLoading(false);
      }
    } catch (err) {
      console.error("ItemList:load:error", err);
      if (_isMounted.current) {
        setInitialLoading(false);
        setBackgroundLoading(false);
      }
    }
  }

  // crawl page 2 until the end of valid pages
  // after each successful page fetch, update item count for display
  // end crawling if component unmounts
  // end crawling on modelZUID change
  // end crawling on error
  async function crawlFetchItems(modelZUID, lang) {
    const limit = PAGE_SIZE;
    let page = 2;
    let totalItems = limit;
    while (totalItems === limit && _isMounted.current) {
      if (modelZUID !== props.modelZUID) break;
      const res = await props.dispatch(
        fetchItems(modelZUID, { limit, page, lang })
      );
      page++;
      totalItems = res._meta.totalResults;
      if (_isMounted.current) {
        setShouldUpdateItemCount(true);
      }
    }
  }

  function updateItemCount() {
    const itemCount = findItems(
      props.allItems,
      props.modelZUID,
      props.selectedLang.ID
    ).length;
    setItemCount(itemCount);
  }

  function loadItem(modelZUID, itemZUID) {
    return props.dispatch(fetchItem(modelZUID, itemZUID));
  }

  function searchItem(itemZUID) {
    return props.dispatch(searchItems(itemZUID));
  }

  function saveItems() {
    setSaving(true);
    return Promise.all(
      props.dirtyItems.map(itemZUID => props.dispatch(saveItem(itemZUID)))
    )
      .then(results => {
        setSaving(false);
        let success = false;
        // display notification for each missing required field on each item
        results.forEach(result => {
          if (result.err === "MISSING_REQUIRED") {
            result.missingRequired.forEach(field => {
              props.dispatch(
                notify({
                  message: `Missing required field "${field.label}" on ${field.ZUID}`,
                  kind: "warn"
                })
              );
            });
          } else {
            success = true;
          }
        });
        // if any of the items succeeded display a success notification
        if (success) {
          props.dispatch(
            notify({
              message: `All ${props.model.label} changes saved`,
              kind: "save"
            })
          );
        }
      })
      .catch(err => {
        setSaving(false);
        console.error("ItemList:saveItems:error", err);
        props.dispatch(
          notify({
            message: `There was an issue saving these changes`,
            kind: "warn"
          })
        );
      });
  }

  // Allow for item edits in list view
  function onChange(itemZUID, key, value) {
    props.dispatch({
      type: "SET_ITEM_DATA",
      itemZUID,
      key,
      value
    });
    setItems(
      items.map(item => {
        if (item.meta && item.meta.ZUID === itemZUID) {
          return {
            ...item,
            data: {
              ...item.data,
              [key]: value
            },
            dirty: true
          };
        }
        return item;
      })
    );
  }

  function getRowSize(index) {
    return index === 0 ? 55 : 90;
  }

  function persistFilters() {
    if (!isEqual(filter, props.filters[props.modelZUID])) {
      props.dispatch({
        type: "PERSIST_LIST_FILTERS",
        modelZUID: props.modelZUID,
        filters: filter
      });
    }
  }

  function clearFilters() {
    setFilter(DEFAULT_FILTER);
  }

  function filterByStatus(items, status) {
    switch (status) {
      case "scheduled":
        return items.filter(
          item => item.scheduling && item.scheduling.isScheduled
        );
      case "published":
        return items.filter(
          item =>
            item.publishing &&
            item.publishing.isPublished &&
            (!item.scheduling || !item.scheduling.isScheduled)
        );
      case "unpublished":
        return items.filter(
          item =>
            (!item.publishing || !item.publishing.isPublished) &&
            (!item.scheduling || !item.scheduling.isScheduled)
        );
      case "all":
      default:
        return items;
    }
  }

  function sortItems(items, { reverse, col, type }) {
    items.sort((a, b) => {
      if (type === "date" || type === "datetime") {
        const dateA = new Date(a.data[col]);
        const dateB = new Date(b.data[col]);
        return reverse ? dateA - dateB : dateB - dateA;
      }
      if (type === "number" || type === "sort") {
        const numA = Number(a.data[col]);
        const numB = Number(b.data[col]);
        return reverse ? numA - numB : numB - numA;
      }
      // else we assume the type is string
      const aStr = String(a.data[col]);
      const bStr = String(b.data[col]);
      return reverse ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }

  function runFilters() {
    const { filterTerm, sortedBy, status, colType } = filter;
    if (filterTerm !== DEFAULT_FILTER.filterTerm) {
      runTermFilter();
    } else if (status !== DEFAULT_FILTER.status) {
      runStatusFilter();
    } else if (sortedBy !== DEFAULT_FILTER.sortedBy) {
      runSort(sortedBy, colType);
    } else {
      updateItemsAndFields();
    }
  }

  /*
    -=runFilterTerm, runFilterStatus and runSort=-
    each of these functions needs to respect
    the state of one another. in achieving this
    some code is duplicated.

    runFilterTerm can perform all three actions
    as it is dealing with all of the items in the global state.

    runFilterStatus 

    runSort only deals with the in state items so can work
    autonomously.
    */
  function onFilter(value) {
    setFilter({ ...filter, filterTerm: value.toLowerCase() });
  }
  function runTermFilter() {
    const newFields = findFields(props.allFields, props.modelZUID);
    let filteredItems = findItems(
      props.allItems,
      props.modelZUID,
      props.selectedLang.ID
    );

    // Only calculate this once
    const fieldsWithRelatedFields = newFields.filter(
      field => field.settings && field.settings.relatedField
    );

    const relatedFields = newFields.filter(
      field => field.relatedFieldZUID && field.relatedModelZUID
    );

    const { filterTerm } = filter;

    filteredItems = filteredItems.filter(item => {
      // first check items data
      const itemData = Object.values(item.data)
        .join(" ")
        .toLowerCase();
      if (itemData.includes(filterTerm)) {
        return true;
      }

      // Second check item web
      const itemWeb = Object.values(item.web)
        .join(" ")
        .toLowerCase();
      if (itemWeb.includes(filterTerm)) {
        return true;
      }

      /**
            Third check this items relationships
            For each field that describes a relationship find the related item
            and that related items related field then build a string of those
            values that we can match the users search term against
          **/
      const relatedItemsData = fieldsWithRelatedFields
        .map(field => {
          let data = [];

          if (item.data[field.name]) {
            const relatedField = props.allFields[field.settings.relatedField];
            data = item.data[field.name].split(",").map(relatedItemZUID => {
              const relatedItem = props.allItems[relatedItemZUID];
              if (relatedItem && relatedField) {
                return relatedItem.data[relatedField.name];
              } else {
                return "";
              }
            });
          }

          // Generate string of all related item field values
          return data.join(" ");
        })
        .join(" ")
        .toLowerCase();

      if (relatedItemsData.includes(filterTerm)) {
        return true;
      }

      // check related fields values
      const filteredRelatedFields = relatedFields.filter(field => {
        const relatedZUID = item.data[field.name];
        const relatedFieldItem = props.allItems[relatedZUID];
        if (relatedFieldItem) {
          // check item data
          const itemData = Object.values(relatedFieldItem.data)
            .join(" ")
            .toLowerCase();
          if (itemData.includes(filterTerm)) {
            return true;
          }

          // check item web
          const itemWeb = Object.values(relatedFieldItem.web)
            .join(" ")
            .toLowerCase();
          if (itemWeb.includes(filterTerm)) {
            return true;
          }
        }
        return false;
      });

      if (filteredRelatedFields.length) {
        return true;
      }

      return false;
    });

    // handle status if applied
    filteredItems = filterByStatus(filteredItems, filter.status);

    // handle sort order if it is applied
    if (filter.sortedBy && newFields.length) {
      // maintain expected sort oder if designated by user
      sortItems(filteredItems, {
        reverse: filter.reverseSort,
        col: filter.sortedBy,
        type: newFields.find(field => field.name === filter.sortedBy).datatype
      });
    }

    filteredItems.unshift(newFields);
    setItems(filteredItems);
    setFields(newFields);
    resetListScroll();
  }

  function onStatus(status) {
    setFilter({ ...filter, status });
  }
  function runStatusFilter() {
    const { status } = filter;
    const newFields = findFields(props.allFields, props.modelZUID);
    let filteredItems = findItems(
      props.allItems,
      props.modelZUID,
      props.selectedLang.ID
    );
    filteredItems = filterByStatus(filteredItems, status);

    // handle sort order if it is applied
    if (filter.sortedBy && newFields.length) {
      // maintain expected sort oder if designated by user
      sortItems(filteredItems, {
        reverse: filter.reverseSort,
        col: filter.sortedBy,
        type: newFields.find(field => field.name === filter.sortedBy).datatype
      });
    }

    filteredItems.unshift(newFields);
    setItems(filteredItems);
    setFields(newFields);
    resetListScroll();
  }

  function onSort(col, type) {
    const reverseSort =
      col === filter.sortedBy ? !filter.reverseSort : filter.reverseSort;
    setFilter({
      ...filter,
      sortedBy: col,
      colType: type,
      reverseSort
    });
  }
  function runSort() {
    const { sortedBy, colType, reverseSort } = filter;
    // deals only with in state items, safe for filters

    const newFields = findFields(props.allFields, props.modelZUID);
    let sortedItems = findItems(
      props.allItems,
      props.modelZUID,
      props.selectedLang.ID
    );

    // sort the items in state by the column value
    if (sortedBy) {
      sortItems(sortedItems, {
        reverse: reverseSort,
        col: sortedBy,
        type: colType
      });
    } else {
      sortedItems.sort((a, b) => b.meta.createdAt - a.meta.createdAt);
    }

    sortedItems.unshift(newFields);
    setItems(sortedItems);
    setFields(newFields);
  }

  function resetListScroll() {
    if (list.current && (list.current.scrollTop !== 0 || list.scrollX !== 0)) {
      list.current.scrollTo(0, 0);
    }
  }

  if (!props.model) {
    return <NotFound message={`Model "${props.modelZUID}" not found`} />;
  }

  return (
    <main className={styles.ItemList}>
      <SetActions
        user={props.user}
        modelZUID={props.modelZUID}
        model={props.model}
        isDirty={props.dirtyItems.length}
        saving={saving}
        loading={backgroundLoading}
        itemCount={itemCount}
        onSaveAll={saveItems}
        onFilter={onFilter}
        onStatus={onStatus}
        isSorted={filter.sortedBy !== null}
        resetSort={() => onSort(null)}
        filterTerm={filter.filterTerm}
        status={filter.status}
        instance={props.instance}
      />

      {!initialLoading && items.length === 1 ? (
        filter.status !== "all" || filter.filterTerm ? (
          <div className={styles.TableWrap}>
            <SetColumns fields={fields} />
            <div className={styles.FiltersDisplay}>
              <h1>{`No ${props.model &&
                props.model
                  .label} items are displayed, filters are in place. `}</h1>
              <Button kind="secondary" onClick={clearFilters}>
                <FontAwesomeIcon icon={faTimes} />
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.TableWrap}>
            <SetColumns fields={fields} />
            <h1 className={styles.Display}>{`No ${props.model &&
              props.model.label} items have been created`}</h1>
          </div>
        )
      ) : (
        <div className={styles.TableWrap} ref={table}>
          <WithLoader
            message={`Loading ${props.model && props.model.label}`}
            condition={(fields.length && items.length > 1) || !initialLoading}
            height="80vh"
          >
            <PendingEditsModal
              show={Boolean(props.dirtyItems.length)}
              title="Unsaved Changes"
              message="You have unsaved changes that will be lost if you leave this page."
              saving={saving || initialLoading}
              onSave={saveItems}
              onDiscard={() => {
                props.dispatch({
                  type: "UNMARK_ITEMS_DIRTY",
                  items: props.dirtyItems
                });
                return Promise.resolve();
              }}
            />

            <DragScroll height={height} width={width} childRef={list}>
              <List
                className={"ItemList"}
                outerRef={list}
                overscanCount={20}
                itemCount={items.length}
                itemSize={getRowSize}
                itemData={{
                  modelZUID: props.modelZUID,
                  model: props.model,
                  items,
                  allItems: props.allItems,
                  fields,
                  allFields: props.allFields,
                  onChange,
                  loadItem,
                  searchItem,
                  sortedBy: filter.sortedBy,
                  onSort,
                  reverseSort: filter.reverseSort
                }}
                height={height}
                width={width}
              >
                {RowRender}
              </List>
            </DragScroll>
          </WithLoader>
        </div>
      )}
    </main>
  );
});

class RowRender extends PureComponent {
  render() {
    const {
      modelZUID,
      model,
      items,
      allItems,
      fields,
      allFields,
      onChange,
      loadItem,
      searchItem,
      sortedBy,
      reverseSort
    } = this.props.data;

    const item = items[this.props.index];

    if (this.props.index === 0) {
      return (
        <SetColumns
          style={this.props.style}
          key={this.props.index}
          fields={item}
          sortedBy={sortedBy}
          onSort={this.props.data.onSort}
          reverseSort={reverseSort}
        />
      );
    } else {
      return (
        <SetRow
          style={{ ...this.props.style, width: "auto", right: 0 }}
          modelZUID={modelZUID}
          model={model}
          // Item data
          data={item.data}
          isDirty={item.dirty}
          itemZUID={item.meta.ZUID || ""}
          // System data
          fields={fields}
          allItems={allItems}
          allFields={allFields}
          // Functions
          onChange={onChange}
          loadItem={loadItem}
          searchItem={searchItem}
        />
      );
    }
  }
}
