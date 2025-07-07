import { forwardRef, memo, useEffect, useRef, useMemo } from "react";
import {
  TreeItem2,
  TreeItem2Props,
  TreeItem2SlotProps,
  useTreeItem2,
} from "@mui/x-tree-view";

import { NavTreeLabel } from "./NavTreeLabel";

export const RichTreeItem = memo(
  forwardRef((props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children } = props;
    const { publicAPI } = useTreeItem2({
      id,
      itemId,
      children,
      label,
      disabled,
      rootRef: ref,
    });
    const item = publicAPI.getItem(itemId);

    console.log(props.label, item);

    return (
      <TreeItem2
        {...props}
        children={props.children}
        ref={ref}
        slots={{ label: NavTreeLabel }}
        slotProps={
          {
            content: {
              // sx: { border: "1px solid white" },
            },
          } as TreeItem2SlotProps
        }
      />
    );
  })
);
RichTreeItem.displayName = "RichTreeItem";
