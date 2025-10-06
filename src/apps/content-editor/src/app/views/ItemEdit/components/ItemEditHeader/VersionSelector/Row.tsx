import { memo, useRef } from "react";
import { MenuItem } from "@mui/material";
import { type RowComponentProps } from "react-window";

import { Version, VersionItem } from "./VersionItem";

type RowProps = {
  versions: Version[];
  activeVersion: number;
  handleLoadVersion: (version: number) => void;
};

export const Row = memo(
  ({
    index,
    style,
    versions,
    activeVersion,
    handleLoadVersion,
  }: RowComponentProps<RowProps>) => {
    const data = { versions, activeVersion, handleLoadVersion };
    const version = data?.versions[index];

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
          key={version?.itemVersionZUID}
          data={version}
          isActive={data?.activeVersion === version?.itemVersion}
        />
      </MenuItem>
    );
  }
);

Row.displayName = "VersionRow";
