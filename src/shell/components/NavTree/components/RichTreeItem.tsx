import { forwardRef } from "react";
import {
  TreeItem2,
  TreeItem2Props,
  TreeItem2SlotProps,
} from "@mui/x-tree-view";

import { NavTreeLabel } from "./NavTreeLabel";

export const RichTreeItem = forwardRef(
  (props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) => {
    return (
      <TreeItem2
        {...props}
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
  }
);
RichTreeItem.displayName = "RichTreeItem";
