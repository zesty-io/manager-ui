import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import debounce from "lodash.debounce";

import { Select, Option } from "@zesty-io/core/Select";
import { Infotip } from "@zesty-io/core/Infotip";

import { searchItems } from "shell/store/content";

import styles from "./ItemParent.less";
export const ItemParent = connect(state => {
  return {
    nav: state.navContent.raw
  };
})(
  React.memo(
    function ItemParent(props) {
      const [loading, setLoading] = useState(false);
      const [parent, setParent] = useState({
        meta: {
          ZUID: "0", // "0" = root level route
          path: "/"
        }
      });

      const [parents, setParents] = useState(
        parentOptions(props.path, props.content)
      );

      const onSearch = debounce((_, term) => {
        if (term) {
          setLoading(true);
          props.dispatch(searchItems(term)).then(res => {
            setLoading(false);
            setParents(
              parentOptions(props.path, {
                ...props.content,
                ...res.data
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
        const navEntry = props.nav.find(el => el.ZUID === zuid);
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
              return false;
            }
          }
        } else {
          return false;
        }
      };

      useEffect(() => {
        let parentZUID = props.parentZUID;

        // If it's a new item chase down the parentZUID within navigation
        // This way we avoid an API request
        if (props.itemZUID && props.itemZUID.slice(0, 3) === "new") {
          const result = findNavParent(props.modelZUID);
          if (result) {
            // change for preselection
            parentZUID = result.ZUID;

            // Update redux store so if the item is saved we know it's parent
            props.onChange("parentZUID", parentZUID);
          }
        }

        // Try to preselect parent
        if (parentZUID && parentZUID != "0" && parentZUID !== null) {
          const item = props.content[parentZUID];
          if (item && item.meta && item.meta.ZUID && item.meta.path) {
            setParent(item);
          } else {
            props.dispatch(searchItems(parentZUID)).then(res => {
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
                parentOptions(props.path, {
                  ...props.content,
                  [res.data[0].meta.ZUID]: res.data[0]
                })
              );
            });
          }
        }
      }, []);

      return (
        <article className={styles.ItemParent} data-cy="itemParent">
          <label>
            <Infotip title="Set which page this one will be nested beneath. This effects both automatically generated navigation and the URL structure for this page." />
            &nbsp; Select this Page's Parent
          </label>

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
              <Option value="0" html="<i class='fa fa-home'></i>&nbsp;/" />
              {parents.map(item => (
                <Option key={item.value} value={item.value} text={item.text} />
              ))}
            </Select>
          )}
        </article>
      );
    },
    (prevProps, nextProps) => {
      let isEqual = true;

      // Shallow compare all props
      Object.keys(prevProps).forEach(key => {
        // ignore content, we'll check it seperately after
        if (key !== "content") {
          if (prevProps[key] !== nextProps[key]) {
            isEqual = false;
          }
        }
      });

      let prevItemsLen = Object.keys(prevProps["content"]).length;
      let nextItemsLen = Object.keys(nextProps["content"]).length;

      // Compare content length to see if new ones where added
      if (prevItemsLen !== nextItemsLen) {
        isEqual = false;
      }

      return isEqual;
    }
  )
);

function parentOptions(path, items) {
  return (
    Object.keys(items)
      // Filter items into list of zuids
      .filter(
        itemZUID =>
          itemZUID.slice(0, 3) !== "new" && // Exclude new items
          items[itemZUID].meta &&
          items[itemZUID].meta.ZUID && // must have a ZUID
          items[itemZUID].web &&
          items[itemZUID].web.path && // must have a path
          items[itemZUID].web.path !== "/" && // Exclude homepage
          items[itemZUID].web.path !== path // Exclude current item
      )
      // De-dupe list of zuids & convert to item objects
      .reduce((acc, zuid) => {
        let exists = acc.find(el => el.meta.ZUID === zuid);

        if (!exists) {
          acc.push(items[zuid]);
        }

        return acc;
      }, [])
      // Convert items to options object
      .map(item => {
        return {
          value: item.meta.ZUID,
          text: item.web.path
        };
      })
      // Put items in alphabetical descending order
      .sort((a, b) => {
        if (a.text > b.text) {
          return 1;
        } else if (a.text < b.text) {
          return -1;
        } else {
          return 0;
        }
      })
  );
}
