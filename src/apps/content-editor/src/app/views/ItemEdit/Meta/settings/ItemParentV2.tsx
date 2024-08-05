import { Autocomplete, TextField, ListItem } from "@mui/material";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import {
  ContentItem,
  ContentItemWithDirtyAndPublishing,
  ContentNavItem,
} from "../../../../../../../../shell/services/types";
import { uniqBy } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { notify } from "../../../../../../../../shell/store/notifications";
import { searchItems } from "../../../../../../../../shell/store/content";
import {
  useGetContentItemsQuery,
  useGetContentNavItemsQuery,
} from "../../../../../../../../shell/services/instance";

type ParentOption = {
  value: string;
  text: string;
};
const getParentOptions = (
  currentItemLangID: number,
  path: string,
  items: Record<string, ContentItemWithDirtyAndPublishing>
) => {
  const options: ParentOption[] = Object.entries(items)
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

  // Insert the home route
  options.unshift({
    text: "/",
    value: "0", // 0 = root level
  });

  return uniqBy(options, "value");
};

const findNavParent = (zuid: string, nav: ContentNavItem[], count = 0): any => {
  count++;
  const navEntry = nav.find((el: any) => el.ZUID === zuid);
  if (navEntry) {
    // This first item should be the model we are resolving for so
    // continue on up the nav tree
    if (count === 0) {
      return findNavParent(navEntry.parentZUID, nav, count);
    } else {
      if (navEntry.type === "item") {
        return navEntry.ZUID;
      } else if (navEntry.parentZUID) {
        return findNavParent(navEntry.parentZUID, nav, count);
      } else {
        return "0";
      }
    }
  } else {
    return "0";
  }
};

type ItemParentProps = {
  onChange: (value: string, name: string) => void;
  value: string;
};
export const ItemParent = ({ onChange, value }: ItemParentProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const dispatch = useDispatch();
  const items = useSelector((state: AppState) => state.content);
  const item = items[itemZUID];
  const { data: rawNavData } = useGetContentNavItemsQuery();
  const [selectedParent, setSelectedParent] = useState<ParentOption>({
    value: "0", // "0" = root level route
    text: "/",
  });
  const [options, setOptions] = useState(
    getParentOptions(item?.meta?.langID, item?.web?.path, items)
  );

  useEffect(() => {
    let { parentZUID } = item?.web;
    console.log(parentZUID);
    const { ZUID: itemZUID } = item?.meta;

    // If it's a new item chase down the parentZUID within navigation
    // This way we avoid an API request
    if (itemZUID && itemZUID.slice(0, 3) === "new") {
      const result = findNavParent(modelZUID, rawNavData);

      // change for preselection
      parentZUID = result;

      // Update redux store so if the item is saved we know it's parent
      onChange(parentZUID, "parentZUID");
    }

    // Try to preselect parent
    if (parentZUID) {
      const parentItem = items[parentZUID];
      if (parentItem?.meta?.ZUID && parentItem?.web?.path) {
        console.log("parent item", parentItem);
        setSelectedParent({
          value: parentItem.meta.ZUID,
          text: parentItem.web.path,
        });
      } else {
        dispatch(searchItems(parentZUID))
          // @ts-expect-error untyped
          .then((res) => {
            if (res?.data) {
              if (Array.isArray(res.data) && res.data.length) {
                // Handles cases where the model's parent is the homepage. This is no longer possible for newly created models but
                // there are some old models that still have the homepage as their parent models.
                if (res.data[0]?.web?.path === "/") {
                  setSelectedParent({
                    value: "0", // "0" = root level route
                    text: "/",
                  });
                } else {
                  setSelectedParent({
                    value: res.data?.[0]?.meta?.ZUID,
                    text: res.data?.[0]?.web?.path,
                  });
                  /**
                   * // HACK Because we pre-load all item publishings and store them in the same reducer as the `content`
                   * we can't use array length comparision to determine a new parent has been added. Also since updates to the item
                   * currently being edited cause a new `content` object to be created in it's reducer we can't use
                   * referential equality checks to determine re-rendering. This scenario causes either the parent to not be pre-selected
                   * or a performance issue. To work around this we maintain the `parents` state internal and add the new parent we load from the
                   * API to allow it to be pre-selected while avoiding re-renders on changes to this item.
                   */

                  setOptions(
                    getParentOptions(item?.meta?.langID, item?.web?.path, {
                      ...items,
                      [res.data[0].meta.ZUID]: res.data[0],
                    })
                  );
                }
              } else {
                dispatch(
                  notify({
                    kind: "warn",
                    heading: `Cannot Save: ${item?.web?.metaTitle}`,
                    message: `Page's Parent does not exist or has been deleted`,
                  })
                );
              }
            } else {
              dispatch(
                notify({
                  kind: "warn",
                  message: `API failed to return data. Try Again.`,
                })
              );
            }
          });
      }
    }
  }, []);

  return (
    <FieldShell
      settings={{
        label: "Select this Page's Parent",
      }}
      customTooltip="Set which page this one will be nested beneath. This effects both automatically generated navigation and the URL structure for this page."
      withInteractiveTooltip={false}
      errors={{}}
    >
      <Autocomplete
        disableClearable
        options={options}
        value={selectedParent}
        fullWidth
        renderInput={(params) => <TextField {...params} />}
        renderOption={(props, value) => (
          <ListItem {...props} key={value.value}>
            {value.text}
          </ListItem>
        )}
        getOptionLabel={(option) => option.text}
        sx={{
          "& .MuiOutlinedInput-root": {
            padding: "2px",
          },
        }}
      />
    </FieldShell>
  );
};
