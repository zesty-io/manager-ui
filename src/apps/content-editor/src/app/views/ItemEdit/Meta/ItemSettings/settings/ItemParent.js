import { memo, Fragment, useState, useEffect } from "react";
import { connect, useSelector } from "react-redux";
import { debounce, uniqBy } from "lodash";
import { notify } from "shell/store/notifications";

import { Select, Option } from "@zesty-io/core/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";

import { searchItems } from "shell/store/content";
import { FieldShell } from "../../../../../components/Editor/Field/FieldShell";

import styles from "./ItemParent.less";
export const ItemParent = connect((state) => {
  return {
    nav: state.navContent.raw,
  };
})(
  memo(
    function ItemParent(props) {
      const items = useSelector((state) => state.content);
      const [loading, setLoading] = useState(false);
      const [parent, setParent] = useState({
        meta: {
          ZUID: "0", // "0" = root level route
          path: "/",
        },
      });

      const [parents, setParents] = useState(
        parentOptions(props.currentItemLangID, props.path, items)
      );

      const onSearch = debounce((term) => {
        if (term) {
          setLoading(true);
          props.dispatch(searchItems(term)).then((res) => {
            setLoading(false);
            setParents(
              parentOptions(props.currentItemLangID, props.path, {
                ...items,
                // needs to reduce and converts this data as the same format of the items to
                // prevent having an issue on having an itemZUID with an incorrect format
                // the reason is that the item has a format of {[itemZUID]:data}
                // while the res.data has a value of an array which cause the needs of converting
                // the response to an object with a zuid as a key
                ...res?.data.reduce((acc, curr) => {
                  return { ...acc, [curr.meta.ZUID]: curr };
                }, {}),
              })
            );
          });
        }
      }, 250);

      /**
       * Recurse nav linked list to find current items parent
       * @param {*} zuid
       * @param {*} count
       */
      const findNavParent = (zuid, count = 0) => {
        count++;
        const navEntry = props.nav.find((el) => el.ZUID === zuid);
        if (navEntry) {
          // This first item should be the model we are resolving for so
          // continue on up the nav tree
          if (count === 0) {
            return findNavParent(navEntry.parentZUID, count);
          } else {
            if (navEntry.type === "item") {
              return navEntry;
            } else if (navEntry.parentZUID) {
              return findNavParent(navEntry.parentZUID, count);
            } else {
              return { ZUID: "0" };
            }
          }
        } else {
          return { ZUID: "0" };
        }
      };

      useEffect(() => {
        let parentZUID = props.parentZUID;

        // If it's a new item chase down the parentZUID within navigation
        // This way we avoid an API request
        if (props.itemZUID && props.itemZUID.slice(0, 3) === "new") {
          const result = findNavParent(props.modelZUID);

          // change for preselection
          parentZUID = result.ZUID;

          // Update redux store so if the item is saved we know it's parent
          props.onChange(parentZUID, "parentZUID");
        }

        // Try to preselect parent
        if (parentZUID && parentZUID != "0" && parentZUID !== null) {
          const item = items[parentZUID];
          if (item && item.meta && item.meta.ZUID && item.meta.path) {
            setParent(item);
          } else {
            props.dispatch(searchItems(parentZUID)).then((res) => {
              if (res) {
                if (res.data) {
                  if (Array.isArray(res.data) && res.data.length) {
                    setParent(res.data[0]);
                    /**
                     * // HACK Because we pre-load all item publishings and store them in the same reducer as the `content`
                     * we can't use array length comparision to determine a new parent has been added. Also since updates to the item
                     * currently being edited cause a new `content` object to be created in it's reducer we can't use
                     * referential equality checks to determine re-rendering. This scenario causes either the parent to not be pre-selected
                     * or a performance issue. To work around this we maintain the `parents` state internal and add the new parent we load from the
                     * API to allow it to be pre-selected while avoiding re-renders on changes to this item.
                     */

                    setParents(
                      parentOptions(props.currentItemLangID, props.path, {
                        ...items,
                        [res.data[0].meta.ZUID]: res.data[0],
                      })
                    );
                  } else {
                    props.dispatch(
                      notify({
                        kind: "warn",
                        message: `Parent item not found ${res.status}`,
                      })
                    );
                  }
                } else {
                  props.dispatch(
                    notify({
                      kind: "warn",
                      message: `API failed to return data ${res.status}`,
                    })
                  );
                }
              } else {
                props.dispatch(
                  notify({
                    kind: "warn",
                    message: `API failed to return response when searching for ${parentZUID}`,
                  })
                );
              }
            });
          }
        }
      }, []);

      return (
        <article className={styles.ItemParent} data-cy="itemParent">
          <FieldShell
            settings={{
              label: "Select this Page's Parent",
            }}
            customTooltip="Set which page this one will be nested beneath. This effects both automatically generated navigation and the URL structure for this page."
            withInteractiveTooltip={false}
          >
            {/*
            Delay rendering select until we have a parent.
            Sometimes we have to resolve the parent from the API asynchronously
          */}
            {!parent ? (
              "Loading item parent"
            ) : (
              <Select
                name="parentZUID"
                placeholder={props.placeholder}
                value={parent.meta.ZUID}
                onSelect={props.onChange}
                onFilter={onSearch}
                // always render search input
                searchPlaceholder="Do not see the path you are looking for? Enter a path to search your API."
                searchLength="0"
                loading={loading}
              >
                <Option
                  value="0"
                  component={
                    <Fragment>
                      <FontAwesomeIcon icon={faHome} />
                      &nbsp;/
                    </Fragment>
                  }
                />
                {parents?.map((item) => (
                  <Option
                    key={item.value}
                    value={item.value}
                    text={item.text}
                  />
                ))}
              </Select>
            )}
          </FieldShell>
        </article>
      );
    },
    (prevProps, nextProps) => {
      let isEqual = true;

      // Shallow compare all props
      Object.keys(prevProps).forEach((key) => {
        // ignore content, we'll check it seperately after
        if (key !== "content") {
          if (prevProps[key] !== nextProps[key]) {
            isEqual = false;
          }
        }
      });

      return isEqual;
    }
  )
);

function parentOptions(currentItemLangID, path, items) {
  const options = Object.entries(items)
    ?.reduce((acc, [itemZUID, itemData]) => {
      if (
        itemZUID.slice(0, 3) !== "new" && // Exclude new items
        itemData?.meta?.ZUID && // must have a ZUID
        itemData?.web?.path && // must have a path
        itemData?.web.path !== "/" && // Exclude homepage
        itemData?.web.path !== path && // Exclude current item
        itemData?.meta?.langID === currentItemLangID // display only relevant language options
      ) {
        acc.push({
          value: itemZUID,
          text: itemData.web.path,
        });
      }

      return acc;
    }, [])
    .sort((a, b) => {
      if (a.text > b.text) {
        return 1;
      } else if (a.text < b.text) {
        return -1;
      } else {
        return 0;
      }
    });

  return uniqBy(options, "value");
}
