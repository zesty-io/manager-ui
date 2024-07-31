import {
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  MenuList,
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
  DesignServicesRounded,
  VisibilityRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material";
import { useState } from "react";
import { Database } from "@zesty-io/material";
import { useHistory, useParams } from "react-router";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItem } from "../../../../../../../../shell/services/types";
import { DuplicateItemDialog } from "./DuplicateItemDialog";
import { ApiType } from "../../../../../../../schema/src/app/components/ModelApi";
import { useGetDomainsQuery } from "../../../../../../../../shell/services/accounts";
import { useFilePath } from "../../../../../../../../shell/hooks/useFilePath";
import { DeleteItemDialog } from "./DeleteItemDialog";
import { useGetContentModelsQuery } from "../../../../../../../../shell/services/instance";
import { usePermission } from "../../../../../../../../shell/hooks/use-permissions";
import { CascadingMenuItem } from "../../../../../../../../shell/components/CascadingMenuItem";

export const MoreMenu = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showDuplicateItemDialog, setShowDuplicateItemDialog] = useState(false);
  const [showApiEndpoints, setShowApiEndpoints] = useState<null | HTMLElement>(
    null
  );
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false);
  const [apiEndpointType, setApiEndpointType] = useState("quick-access");
  const history = useHistory();
  const codePath = useFilePath(modelZUID);
  const { data: contentModels } = useGetContentModelsQuery();
  const type =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ?? "";
  const canDelete = usePermission("DELETE");

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
        title="More Options"
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
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setShowDuplicateItemDialog(true);
          }}
        >
          <ListItemIcon>
            <ContentCopyRounded />
          </ListItemIcon>
          Duplicate Item
        </MenuItem>
        <MenuItem onClick={() => handleCopyClick(itemZUID)}>
          <ListItemIcon>
            {isCopied ? <CheckRounded /> : <WidgetsRounded />}
          </ListItemIcon>
          Copy ZUID
        </MenuItem>
        <CascadingMenuItem
          MenuItemComponent={
            <>
              <ListItemIcon>
                <BoltRounded />
              </ListItemIcon>
              View Quick Access API
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
                View Site Generators API
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
          Edit Model
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(codePath);
          }}
        >
          <ListItemIcon>
            <CodeRounded />
          </ListItemIcon>
          Edit Template
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
            Delete Item
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
    </>
  );
};

type APIEndpointsProps = {
  type: Extract<ApiType, "quick-access" | "site-generators">;
};
const APIEndpoints = ({ type }: APIEndpointsProps) => {
  const { itemZUID } = useParams<{
    itemZUID: string;
  }>();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const instance = useSelector((state: AppState) => state.instance);
  const { data: domains } = useGetDomainsQuery();

  const apiTypeEndpointMap: Partial<Record<ApiType, string>> = {
    "quick-access": `/-/instant/${itemZUID}.json`,
    "site-generators": item ? `/${item?.web?.path}/?toJSON` : "/?toJSON",
  };

  const liveDomain = domains?.find((domain) => domain.branch == "live");

  return (
    <MenuList>
      <MenuItem
        onClick={() => {
          window.open(
            // @ts-expect-error config not typed
            `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`,
            "_blank"
          );
        }}
      >
        <ListItemIcon>
          <DesignServicesRounded />
        </ListItemIcon>
        <Typography
          variant="inherit"
          noWrap
          sx={{
            width: 172,
          }}
        >
          {/* @ts-expect-error config not typed */}
          {`${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[type]}`}
        </Typography>
        <Chip size="small" label="Dev" />
      </MenuItem>
      {liveDomain && (
        <MenuItem
          onClick={() => {
            window.open(
              `https://${liveDomain.domain}${apiTypeEndpointMap[type]}`,
              "_blank"
            );
          }}
        >
          <ListItemIcon>
            <VisibilityRounded />
          </ListItemIcon>
          <Typography
            variant="inherit"
            noWrap
            sx={{
              width: 172,
            }}
          >
            {`${liveDomain.domain}${apiTypeEndpointMap[type]}`}
          </Typography>
          <Chip size="small" label="Prod" />
        </MenuItem>
      )}
    </MenuList>
  );
};
