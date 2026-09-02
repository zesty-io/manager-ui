import {
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  MoreHorizRounded,
  WidgetsRounded,
  ContentCopyRounded,
  BoltRounded,
  DataObjectRounded,
  CodeRounded,
  DeleteRounded,
  CheckRounded,
  KeyboardArrowRightRounded,
  DriveFileRenameOutlineRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { Database } from "@zesty-io/material";
import { useHistory, useParams } from "react-router";
import { DuplicateItemDialog } from "./DuplicateItemDialog";
import { useFilePath } from "../../../../../../../../shell/hooks/useFilePath";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { useGetContentModelsQuery } from "../../../../../../../../shell/services/instance";
import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
import { CascadingMenuItem } from "../../../../../../../../shell/components/CascadingMenuItem";
import { APIEndpoints } from "../../../../components/APIEndpoints";
import { RenameItemDialog } from "./RenameItemDialog";
import { useTranslation } from "react-i18next";

export const MoreMenu = () => {
  const { t } = useTranslation();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDuplicateItemDialog, setShowDuplicateItemDialog] = useState(false);
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const history = useHistory();
  const codePath = useFilePath(modelZUID);
  const { data: contentModels } = useGetContentModelsQuery();
  const type =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ?? "";
  const canDelete = usePermission("DELETE", itemZUID);

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <>
      <Tooltip
        title={t("content.itemEditMoreOptions")}
        enterDelay={1000}
        enterNextDelay={1000}
        placement="bottom-start"
      >
        <IconButton
          data-cy="ContentItemMoreButton"
          size="small"
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
        >
          <MoreHorizRounded fontSize="small" />
        </IconButton>
      </Tooltip>
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
        PaperProps={{
          sx: {
            width: 288,
          },
        }}
      >
        {type === "block" && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              setShowRenameDialog(true);
            }}
          >
            <ListItemIcon>
              <DriveFileRenameOutlineRounded />
            </ListItemIcon>
            {t("content.itemEditRenameVariant")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setShowDuplicateItemDialog(true);
          }}
        >
          <ListItemIcon>
            <ContentCopyRounded />
          </ListItemIcon>
          {type === "block"
            ? t("content.itemEditDuplicateVariant")
            : t("content.itemEditDuplicateItem")}
        </MenuItem>
        <MenuItem onClick={() => handleCopyClick(itemZUID)}>
          <ListItemIcon>
            {isCopied ? <CheckRounded /> : <WidgetsRounded />}
          </ListItemIcon>
          {t("content.itemListCopyZuid")}
        </MenuItem>
        <CascadingMenuItem
          MenuItemComponent={
            <>
              <ListItemIcon>
                <BoltRounded />
              </ListItemIcon>
              {t("content.itemListViewQuickAccessApi")}
              <KeyboardArrowRightRounded color="action" sx={{ ml: "auto" }} />
            </>
          }
        >
          <APIEndpoints type="quick-access" />
        </CascadingMenuItem>
        {type !== "dataset" && (
          <CascadingMenuItem
            MenuItemComponent={
              <>
                <ListItemIcon>
                  <DataObjectRounded />
                </ListItemIcon>
                {t("content.itemListViewSiteGeneratorsApi")}
                <KeyboardArrowRightRounded color="action" sx={{ ml: "auto" }} />
              </>
            }
          >
            <APIEndpoints type="site-generators" />
          </CascadingMenuItem>
        )}
        <MenuItem
          onClick={() => {
            history.push(`/schema/${modelZUID}`);
          }}
        >
          <ListItemIcon>
            <Database />
          </ListItemIcon>
          {t("content.itemListEditModel")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(codePath);
          }}
        >
          <ListItemIcon>
            <CodeRounded />
          </ListItemIcon>
          {t("content.itemListEditTemplate")}
        </MenuItem>
        {canDelete && (
          <MenuItem
            data-cy="DeleteContentItem"
            onClick={() => {
              setShowDeleteItemDialog(true);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DeleteRounded />
            </ListItemIcon>
            {type === "block"
              ? t("content.itemEditDeleteVariant")
              : t("content.itemEditDeleteItem")}
          </MenuItem>
        )}
      </Menu>
      {showDuplicateItemDialog && (
        <DuplicateItemDialog
          onClose={() => setShowDuplicateItemDialog(false)}
        />
      )}
      {showDeleteItemDialog && (
        <DeleteItemDialog onClose={() => setShowDeleteItemDialog(false)} />
      )}
      {showRenameDialog && (
        <RenameItemDialog onClose={() => setShowRenameDialog(false)} />
      )}
    </>
  );
};
