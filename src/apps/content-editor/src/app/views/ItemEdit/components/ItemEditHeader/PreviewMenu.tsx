import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { DesignServicesRounded, LanguageRounded } from "@mui/icons-material";
import { useState } from "react";
import { ScreenShare } from "@zesty-io/material";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { useDomain } from "../../../../../../../../shell/hooks/use-domain";
import { ContentItemWithDirtyAndPublishing } from ".";
import { useGetItemPublishingsQuery } from "../../../../../../../../shell/services/instance";

export const PreviewMenu = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const domain = useDomain();
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );
  const { data: itemPublishings } = useGetItemPublishingsQuery({
    modelZUID,
    itemZUID,
  });
  const activePublishing = itemPublishings?.find(
    (itemPublishing) => itemPublishing._active
  );
  const instance = useSelector((state: AppState) => state.instance);
  const previewLock = useSelector((state: AppState) =>
    state.settings.instance.find(
      (setting: any) => setting.key === "preview_lock_password" && setting.value
    )
  );
  const pathPart = item.web.pathPart !== "zesty_home" ? item.web.path : "";
  const prodUrl = domain + pathPart;

  // @ts-expect-error Config not typed
  let devUrl = `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${item?.web?.path}`;

  if (previewLock) {
    devUrl = `${devUrl}?zpw=${previewLock.value}`;
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <ScreenShare fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: "right",
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            window.open(devUrl, "_blank");
          }}
        >
          <ListItemIcon>
            <DesignServicesRounded />
          </ListItemIcon>
          Draft Preview - v{item?.meta?.version}
        </MenuItem>
        {activePublishing && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              window.open(prodUrl, "_blank");
            }}
          >
            <ListItemIcon>
              <LanguageRounded />
            </ListItemIcon>
            Production Preview -v{activePublishing?.version}
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
