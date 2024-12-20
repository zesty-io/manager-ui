import { useEffect, CSSProperties, useRef, memo } from "react";
import { MenuItem } from "@mui/material";
import { areEqual } from "react-window";

import { Version, VersionItem } from "./VersionItem";
import { useResizeObserver } from "../../../../../../../../../shell/hooks/useResizeObserver";

type RowProps = {
  index: number;
  style: CSSProperties;
  data: {
    versions: Version[];
    activeVersion: number;
    handleLoadVersion: (version: number) => void;
    setRowHeight: (index: number, size: number) => void;
  };
};
export const Row = memo(({ index, style, data }: RowProps) => {
  const rowRef = useRef(null);
  const version = data?.versions[index];
  const dimensions = useResizeObserver(rowRef);

  useEffect(() => {
    if (!!dimensions) {
      data?.setRowHeight(index, dimensions?.height);
    }
  }, [dimensions]);

  return (
    <MenuItem
      key={version?.itemVersionZUID}
      disableRipple
      sx={{
        borderColor: "border",
        p: 0,
        flexDirection: "column",

        "&.Mui-selected": {
          bgcolor: "background.paper",

          "&.Mui-focusVisible": {
            bgcolor: "background.paper",
          },

          "&:hover": {
            bgcolor: "background.paper",
          },
        },
        ...style,
      }}
      divider={index + 1 < data?.versions?.length}
      selected={data?.activeVersion === version?.itemVersion}
      onClick={() => {
        data?.handleLoadVersion(version?.itemVersion);
      }}
    >
      <VersionItem
        ref={rowRef}
        key={version?.itemVersionZUID}
        data={version}
        isActive={data?.activeVersion === version?.itemVersion}
      />
    </MenuItem>
  );
}, areEqual);

Row.displayName = "VersionRow";
