import { forwardRef, memo } from "react";
import {
  TreeItem2,
  TreeItem2Props,
  TreeItem2SlotProps,
  useTreeItem2,
} from "@mui/x-tree-view";

import { NavTreeLabel } from "./NavTreeLabel";
import { Theme, alpha } from "@mui/material";

type CustomTreeItem2Props = TreeItem2Props & {
  onItemDrop?: (draggedItem: any, targetItem: any) => void;
  dragAndDrop?: boolean;
};
export const RichTreeItem = memo(
  forwardRef((props: CustomTreeItem2Props, ref: React.Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, onItemDrop, dragAndDrop } =
      props;
    const { publicAPI } = useTreeItem2({
      id,
      itemId,
      children,
      label,
      disabled,
      rootRef: ref,
    });
    const item = publicAPI.getItem(itemId);

    if (item?.hidden) {
      return <></>;
    }

    return (
      <TreeItem2
        {...props}
        children={props.children}
        ref={ref}
        slots={{ label: NavTreeLabel }}
        slotProps={
          {
            content: {
              sx: {
                "&:hover, &.hovered": {
                  bgcolor: (theme: Theme) =>
                    alpha(theme.palette.primary.main, 0.08),

                  ".treeActions": {
                    zIndex: 2,
                  },

                  ".treeSpacer": {
                    display: "block",
                  },
                },

                "&.Mui-Focused": {
                  backgroundColor: "primary.light",
                },

                ".MuiTreeItem-label .treeActions [data-cy='tree-item-add-new-content'] svg":
                  {
                    // Makes sure that the add new content icon color does not change when tree item is selected
                    color: "common.white",
                  },

                borderRadius: 0,
                "&.Mui-selected": {
                  borderLeft: "2px solid",
                  borderColor: "primary.main",

                  ".MuiTreeItem-iconContainer svg": {
                    color: "primary.main",
                  },

                  ".MuiTreeItem-label": {
                    color: "primary.main",

                    ".treeIcon": {
                      svg: {
                        color: "primary.main",
                      },
                    },
                  },
                },
              },
              onDragOver: (event: any) => {
                if (dragAndDrop) {
                  event.preventDefault();
                  event.currentTarget.style.backgroundColor = "#f6f6f7";
                }
              },
              onDragLeave: (event: any) => {
                if (dragAndDrop) {
                  event.preventDefault();
                  event.currentTarget.style.backgroundColor = "";
                }
              },
              onDrop: (event: any) => {
                if (dragAndDrop) {
                  event.currentTarget.style.backgroundColor = "";
                  const draggedItem = JSON.parse(
                    event.dataTransfer.getData("text/plain")
                  );
                  onItemDrop && onItemDrop(draggedItem, item?.nodeData);
                }
              },
              onMouseLeave: (event: any) => {
                // This means that a popup has taken focus and we want the tree item to remain hovered
                // The hovered class is removed by a mutation observer on the NavTree component
                if (
                  ["MuiModal-backdrop", "MuiBackdrop-root"].some((className) =>
                    event.relatedTarget.classList.contains(className)
                  )
                ) {
                  event.currentTarget.classList.add("hovered");
                }
              },
            },
            label: {
              labelIcon: item?.icon,
              nodeData: item?.nodeData,
              actions: item?.actions,
            },
          } as TreeItem2SlotProps
        }
      />
    );
  })
);
RichTreeItem.displayName = "RichTreeItem";
