import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import cx from "classnames";
import { VariableSizeList as List } from "react-window";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Button } from "@zesty-io/core/Button";

import { SetActions } from "./SetActions";
import { SetColumns } from "./SetColumns";
import { SetRow } from "./SetRow";

import { DragScroll } from "../../components/DragScroll";
import { PendingEditsModal } from "../../components/PendingEditsModal";

import {
  fetchItem,
  fetchItems,
  searchItems,
  saveItem,
  fetchItemPublishing
} from "shell/store/content";
import { fetchFields } from "shell/store/fields";
import { notify } from "shell/store/notifications";
import { findFields, findItems } from "./findUtils";

import styles from "./ItemList.less";
export default connect((state, props) => {
  const { modelZUID } = props.match.params;
  const model = state.models[modelZUID];

  const selectedLang = state.languages
    ? state.languages.find(lang => lang.code === state.user.selected_lang) || {}
    : {};

  return {
    selectedLang,
    model,
    modelZUID,
    user: state.user,
    filters: state.listFilters,
    sortedBy: "",
    reverseSort: false,
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
})(
  class ItemList extends Component {
    _isMounted = false;

    // We use this ref to determine the list dimensions
    table = React.createRef();
    list = React.createRef();

    state = {
      modelZUID: this.props.modelZUID,
      saving: false,
      loading: false,
      // Keep internal item state for handling table filters performantly
      // avoiding recalculations on component updates
      items: [],
      fields: [],
      height: 1000,
      width: 1000,
      sortedBy: null,
      status:
        (this.props.filters[this.props.modelZUID] &&
          this.props.filters[this.props.modelZUID].status) ||
        "all"
    };

    componentDidMount() {
      this._isMounted = true;

      // Render rows we have available right away
      this.updateRows();

      // apply filters
      if (this.props.filters[this.props.modelZUID]) {
        this.runAllFilters();
      }
      // Hit API to check for new rows
      this.load(this.props.modelZUID);
    }

    componentWillUnmount() {
      this._isMounted = false;
      // save filter data to store
      this.props.dispatch({
        type: "PERSIST_LIST_FILTERS",
        modelZUID: this.props.modelZUID,
        filters: {
          filterTerm: this.state.filterTerm,
          sortedBy: this.state.sortedBy,
          status: this.state.status,
          colType: this.state.colType,
          reverseSort: this.state.reverseSort
        }
      });
    }

    componentDidUpdate(prevProps) {
      if (
        this.props.model &&
        (this.props.model.name === "clippings" ||
          this.props.model.type === "templateset")
      ) {
        // First item is always the column row
        if (this.state.items.length === 2) {
          // redirect to the single entry in content clippings
          window.location.hash = `/content/${this.props.modelZUID}/${this.state.items[1].meta.ZUID}`;
        }
      }

      // Handle changing item list views
      if (this.props.modelZUID !== this.state.modelZUID) {
        this.updateRows();
        // Clear previous model and load any new model rows we have available

        // Load new model from API
        this.load(this.props.modelZUID);
        if (this.props.filters[this.props.modelZUID]) {
          this.runAllFilters();
        } else {
          this.setState({
            filterTerm: "",
            sortedBy: null,
            status: "all",
            colType: null,
            reverseSort: false
          });
        }
      }

      // Update rows when they are made dirty
      if (prevProps.dirtyItems.length !== this.props.dirtyItems.length) {
        this.updateRows();
      }

      // Update table dimensions if they've changed
      if (
        this.table.current &&
        (this.state.height !== this.table.current.clientHeight ||
          this.state.width !== this.table.current.clientWidth)
      ) {
        this.setState({
          height: this.table.current.clientHeight,
          width: this.table.current.clientWidth
        });
      }
    }

    updateRows = () => {
      let fields = findFields(this.props.allFields, this.props.modelZUID);
      let items = findItems(
        this.props.allItems,
        this.props.modelZUID,
        this.props.selectedLang.ID
      );
      items.unshift(fields);
      this.setState({ items, fields }, () => {
        if (
          this.state.sortedBy ||
          this.state.filterTerm ||
          this.state.status !== "all"
        ) {
          this.runAllFilters();
        }
      });
    };

    load = modelZUID => {
      this.setState({
        loading: true,
        modelZUID
      });

      return Promise.all([
        this.props.dispatch(fetchFields(modelZUID)),
        this.props.dispatch(fetchItems(modelZUID))
      ])
        .then(() => {
          if (this._isMounted) {
            this.updateRows();
            this.setState(
              {
                loading: false
              },
              () => {
                const { filterTerm, sortedBy, status, colType } = this.state;
                if (filterTerm) {
                  this.onFilter(null, filterTerm);
                } else if (status) {
                  this.onStatus(null, status);
                } else if (sortedBy) {
                  this.onSort(sortedBy, colType);
                }
              }
            );
          }
        })
        .catch(err => {
          console.error("ItemList:load:error", err);
          if (this._isMounted) {
            this.setState(
              {
                loading: false
              },
              () => {
                const { filterTerm, sortedBy, status, colType } = this.state;
                if (filterTerm) {
                  this.onFilter(null, filterTerm);
                } else if (status) {
                  this.onStatus(null, status);
                } else if (sortedBy) {
                  this.onSort(sortedBy, colType);
                }
              }
            );
          }
          throw err;
        });
    };

    loadItem = (modelZUID, itemZUID) => {
      return this.props.dispatch(fetchItem(modelZUID, itemZUID));
    };

    loadItemPublishData = (modelZUID, itemZUID) => {
      this.props.dispatch(fetchItemPublishing(modelZUID, itemZUID));
    };

    searchItem = itemZUID => {
      return this.props.dispatch(searchItems(itemZUID));
    };

    saveItems = () => {
      this.setState({
        saving: true
      });
      return Promise.all(
        this.props.dirtyItems.map(itemZUID =>
          this.props.dispatch(saveItem(itemZUID))
        )
      )
        .then(() => {
          this.setState({
            saving: false
          });

          this.props.dispatch(
            notify({
              message: `All ${this.props.model.label} changes saved`,
              kind: "save"
            })
          );
        })
        .catch(err => {
          this.setState({
            saving: false
          });
          console.error("ItemList:saveItems:error", err);
          this.props.dispatch(
            notify({
              message: `There was an issue saving these changes`,
              kind: "warn"
            })
          );
        });
    };

    // Allow for item edits in list view
    onChange = (itemZUID, key, value) => {
      this.props.dispatch({
        type: "SET_ITEM_DATA",
        itemZUID,
        key,
        value
      });
      this.setState({
        items: this.state.items.map(item => {
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
      });
    };

    getRowSize = index => {
      return index === 0 ? 55 : 90;
    };

    runAllFilters = () => {
      const {
        filterTerm,
        sortedBy,
        status,
        colType,
        reverseSort
      } = this.props.filters[this.props.modelZUID];
      if (filterTerm || sortedBy || status) {
        this.setState(
          { filterTerm, sortedBy, status, colType, reverseSort },
          () => {
            if (filterTerm) {
              this.onFilter(null, filterTerm);
            } else if (status) {
              this.onStatus(null, status);
            } else if (sortedBy) {
              this.onSort(sortedBy, colType);
            }
          }
        );
      }
    };

    persistFilters = () => {
      this.props.dispatch({
        type: "PERSIST_LIST_FILTERS",
        modelZUID: this.props.modelZUID,
        filters: {
          filterTerm: this.state.filterTerm,
          sortedBy: this.state.sortedBy,
          status: this.state.status,
          colType: this.state.colType,
          reverseSort: this.state.reverseSort
        }
      });
    };

    clearFilters = () => {
      this.setState(
        {
          filterTerm: "",
          status: "all"
        },
        () => {
          this.persistFilters();
          this.updateRows();
        }
      );
    };
    /*
    -=onFilter, onStatus and onSort=-
    each of these functions needs to respect
    the state of one another. in achieving this
    some code is duplicated.

    onFilter can perform all three actions
    as it is dealing with all of the items in the global state.

    onStatus short circuits itself if there is
    a search term or sort in place

    onSort only deals with the in state items so can work
    autonomously.
    */
    onFilter = (name, value) => {
      let items = findItems(
        this.props.allItems,
        this.props.modelZUID,
        this.props.selectedLang.ID
      );

      if (value) {
        // Only calculate this once
        const fields = this.state.fields.filter(
          field => field.settings && field.settings.relatedField
        );

        value = value.toLowerCase();

        items = items.filter(item => {
          // first check items data
          const itemData = Object.values(item.data)
            .join(" ")
            .toLowerCase();
          if (itemData.includes(value)) {
            return true;
          }

          // Second check item web
          const itemWeb = Object.values(item.web)
            .join(" ")
            .toLowerCase();
          if (itemWeb.includes(value)) {
            return true;
          }

          /**
            Third check this items relationships
            For each field that describes a relationship find the related item
            and that related items related field then build a string of those
            values that we can match the users search term against
          **/
          const relatedItemsData = fields
            .map(field => {
              let data = [];

              if (item.data[field.name]) {
                const relatedField = this.props.allFields[
                  field.settings.relatedField
                ];
                data = item.data[field.name].split(",").map(relatedItemZUID => {
                  const relatedItem = this.props.allItems[relatedItemZUID];
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

          if (relatedItemsData.includes(value)) {
            return true;
          }

          return false;
        });
      }

      // handle status if applied
      if (this.state.status && this.state.status !== "all") {
        const status = this.state.status;
        switch (status) {
          case "scheduled":
            items = items.filter(
              item => item.scheduling && item.scheduling.isScheduled
            );
            break;
          case "published":
            items = items.filter(
              item =>
                item.publishing &&
                item.publishing.isPublished &&
                (!item.scheduling || !item.scheduling.isScheduled)
            );
            break;
          case "unpublished":
            items = items.filter(
              item =>
                (!item.publishing || !item.publishing.isPublished) &&
                (!item.scheduling || !item.scheduling.isScheduled)
            );
            break;
        }
      }

      // handle sort order if it is applied
      if (this.state.sortedBy && this.state.fields.length) {
        // maintain expected sort oder if designated by user
        const reverse = this.state.reverseSort;
        const col = this.state.sortedBy;
        const type = this.state.fields.find(
          field => field.name === this.state.sortedBy
        ).datatype;
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

      items.unshift(this.state.fields);

      //reset the scroll position so that results are shown properly
      if (
        this.list.current &&
        (this.list.current.scrollTop !== 0 || this.list.scrollX !== 0)
      ) {
        this.list.current.scrollTo(0, 0);
      }
      this.setState(
        {
          items,
          filterTerm: value
        },
        () => {
          this.persistFilters();
        }
      );
    };

    onStatus = (name, value) => {
      // if there is a filter term in place
      // run the onFilter which will also
      // handle the status filter
      if (this.state.filterTerm || this.state.sortedBy) {
        return this.setState({ status: value }, () =>
          this.onFilter(null, this.state.filterTerm)
        );
      }

      let items = findItems(
        this.props.allItems,
        this.props.modelZUID,
        this.props.selectedLang.ID
      );

      switch (value) {
        case "scheduled":
          items = items.filter(
            item => item.scheduling && item.scheduling.isScheduled
          );
          break;
        case "published":
          items = items.filter(
            item =>
              item.publishing &&
              item.publishing.isPublished &&
              (!item.scheduling || !item.scheduling.isScheduled)
          );
          break;
        case "unpublished":
          items = items.filter(
            item =>
              (!item.publishing || !item.publishing.isPublished) &&
              (!item.scheduling || !item.scheduling.isScheduled)
          );
          break;
      }

      items.unshift(this.state.fields);

      if (
        this.list.current &&
        (this.list.current.scrollTop !== 0 || this.list.scrollX !== 0)
      ) {
        this.list.current.scrollTo(0, 0);
      }
      // Handles "all"
      this.setState(
        {
          items,
          status: value
        },
        () => {
          this.persistFilters();
        }
      );
    };

    onSort = (col, type) => {
      // deals only with in state items, safe for filters

      let sortedItems = [...this.state.items.slice(1)];
      let reverse =
        col === this.state.sortedBy
          ? !this.state.reverseSort
          : this.state.reverseSort;
      // sort the items in state by the column value
      if (col) {
        sortedItems.sort((a, b) => {
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
      } else {
        sortedItems.sort((a, b) => {
          if (a.meta.createdAt < b.meta.createdAt) {
            return 1;
          }
          if (a.meta.createdAt > b.meta.createdAt) {
            return -1;
          }
          return 0;
        });
      }

      // add cols back to items array
      sortedItems.unshift(this.state.fields);

      return this.setState(
        {
          sortedBy: col,
          colType: type,
          items: sortedItems,
          reverseSort: reverse
        },
        () => {
          this.persistFilters();
        }
      );
    };

    render() {
      return (
        <main className={styles.ItemList}>
          <SetActions
            user={this.props.user}
            modelZUID={this.props.modelZUID}
            model={this.props.model}
            isDirty={this.props.dirtyItems.length}
            saving={this.state.saving}
            loading={this.state.loading}
            itemCount={this.state.items.length - 1}
            onSaveAll={this.saveItems}
            onFilter={this.onFilter}
            onStatus={this.onStatus}
            runAllFilters={this.runAllFilters}
            isSorted={this.state.sortedBy !== null}
            resetSort={() => this.onSort(null)}
            filterTerm={this.state.filterTerm}
            status={this.state.status}
            instance={this.props.instance}
          />

          {!this.state.loading && this.state.items.length === 1 ? (
            this.state.status !== "all" || this.state.filterTerm ? (
              <div className={styles.TableWrap}>
                <SetColumns fields={this.state.fields} />
                <div className={styles.FiltersDisplay}>
                  <h1>{`No ${this.props.model &&
                    this.props.model
                      .label} items are displayed, filters are in place. `}</h1>
                  <Button kind="secondary" onClick={this.clearFilters}>
                    <FontAwesomeIcon icon={faTimes} />
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <div className={styles.TableWrap}>
                <SetColumns fields={this.state.fields} />
                <h1 className={styles.Display}>{`No ${this.props.model &&
                  this.props.model.label} items have been created`}</h1>
              </div>
            )
          ) : (
            <div className={styles.TableWrap} ref={this.table}>
              <WithLoader
                message={`Loading ${this.props.model &&
                  this.props.model.label}`}
                condition={
                  (this.state.fields.length && this.state.items.length > 1) ||
                  !this.state.loading
                }
                height="80vh"
              >
                <PendingEditsModal
                  show={Boolean(this.props.dirtyItems.length)}
                  title="Unsaved Changes"
                  message="You have unsaved changes that will be lost if you leave this page."
                  saving={this.state.saving || this.state.loading}
                  onSave={this.saveItems}
                  onDiscard={() => {
                    this.props.dispatch({
                      type: "UNMARK_ITEMS_DIRTY",
                      items: this.props.dirtyItems
                    });
                    return this.load(this.props.modelZUID);
                  }}
                />

                <DragScroll
                  height={this.state.height}
                  width={this.state.width}
                  childRef={this.list}
                >
                  <List
                    className={"ItemList"}
                    outerRef={this.list}
                    overscanCount={20}
                    itemCount={this.state.items.length}
                    itemSize={this.getRowSize}
                    itemData={{
                      modelZUID: this.props.modelZUID,
                      model: this.props.model,
                      items: this.state.items,
                      allItems: this.props.allItems,
                      fields: this.state.fields,
                      allFields: this.props.allFields,
                      onChange: this.onChange,
                      loadItem: this.loadItem,
                      searchItem: this.searchItem,
                      sortedBy: this.state.sortedBy,
                      onSort: this.onSort,
                      reverseSort: this.state.reverseSort,
                      loadItemPublishData: this.loadItemPublishData
                    }}
                    height={this.state.height}
                    width={this.state.width}
                  >
                    {RowRender}
                  </List>
                </DragScroll>
              </WithLoader>
            </div>
          )}
        </main>
      );
    }
  }
);

class RowRender extends PureComponent {
  onSort = (col, type) => {
    this.props.data.onSort(col, type);
  };
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
      loadItemPublishData,
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
          onSort={this.onSort}
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
          loadItemPublishData={loadItemPublishData}
        />
      );
    }
  }
}
