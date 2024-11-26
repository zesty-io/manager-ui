import { useState, memo } from "react";
import { Button, Menu, MenuItem, Box, Tooltip, Chip } from "@mui/material";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useLocation, useParams } from "react-router";

import {
  useGetContentItemVersionsQuery,
  useGetItemPublishingsQuery,
} from "../../../../../../../../../shell/services/instance";

type VersionSelectorProps = {
  version: number;
};
export const VersionSelector = memo(({ version }: VersionSelectorProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);
  const { data: versions } = useGetContentItemVersionsQuery({
    modelZUID,
    itemZUID,
  });

  return (
    <Tooltip
      title="View Versions"
      enterDelay={1000}
      enterNextDelay={1000}
      placement="top-start"
    >
      <Button
        sx={{
          color: "text.disabled",
          fontWeight: 600,
          height: 28,
          minWidth: "unset",
          padding: 0.25,
          " .MuiButton-endIcon": {
            marginLeft: 0.5,
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        v{version}
        <Chip label="Draft" color="info" size="small" sx={{ ml: 0.5 }} />
      </Button>
    </Tooltip>
  );
});
VersionSelector.displayName = "VersionSelector";
