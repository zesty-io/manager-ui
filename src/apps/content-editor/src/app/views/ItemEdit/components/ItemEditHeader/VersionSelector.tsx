import { Button, Menu, MenuItem, Box } from "@mui/material";
import {
  useGetContentItemVersionsQuery,
  useGetItemPublishingsQuery,
} from "../../../../../../../../shell/services/instance";
import { useLocation, useParams } from "react-router";
import { KeyboardArrowDownRounded } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ContentItem } from "../../../../../../../../shell/services/types";
import { AppState } from "../../../../../../../../shell/store/types";
import { formatDate } from "../../../../../../../../utility/formatDate";

export const VersionSelector = () => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: versions } = useGetContentItemVersionsQuery({
    modelZUID,
    itemZUID,
  });
  const { data: itemPublishings } = useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });

  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );

  const onSelect = (version: ContentItem) => {
    dispatch({
      type: "LOAD_ITEM_VERSION",
      itemZUID: itemZUID,
      data: version,
    });
  };

  useEffect(() => {
    const versionParam = queryParams.get("version");
    const version = versions?.find((v) => v.meta.version === +versionParam);
    if (version) {
      onSelect(version);
    }
  }, [queryParams.get("version"), versions]);

  return (
    <>
      <Button
        sx={{
          color: "text.disabled",
          height: "24px",
          minWidth: "unset",
          padding: "2px",
          " .MuiButton-endIcon": {
            marginLeft: "4px",
          },
        }}
        color="inherit"
        endIcon={<KeyboardArrowDownRounded color="action" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        v{item?.meta?.version}
      </Button>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -10,
          horizontal: "right",
        }}
        anchorEl={anchorEl}
        open={!!anchorEl}
        PaperProps={{
          style: {
            maxHeight: "496px",
            overflow: "auto",
            width: "320px",
          },
        }}
      >
        {versions?.map((version) => (
          <MenuItem
            key={version.meta.version}
            onClick={() => {
              setAnchorEl(null);
              onSelect(version);
            }}
          >
            <Box display="flex" justifyContent="space-between" width="100%">
              <Box>
                {`v${version.meta.version}${
                  itemPublishings?.find(
                    (itemPublishing) => itemPublishing._active
                  )?.version === version.meta.version
                    ? " - Live"
                    : ""
                }`}
              </Box>
              <Box>{formatDate(version.web.createdAt)}</Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
