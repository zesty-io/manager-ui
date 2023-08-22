import {
  Chip,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
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
  const [apiEndpointType, setApiEndpointType] = useState("quick-access");
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const instance = useSelector((state: AppState) => state.instance);
  const { data: domains } = useGetDomainsQuery();
  const codePath = useFilePath(modelZUID);

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

  const apiTypeEndpointMap: Partial<Record<ApiType, string>> = {
    "quick-access": `/-/instant/${itemZUID}.json`,
    "site-generators": item ? `/${item?.web?.pathPart}/?toJSON` : "/?toJSON",
  };

  const liveDomain = domains?.find((domain) => domain.branch == "live");

  return (
    <>
      <IconButton
        size="small"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreHorizRounded fontSize="small" />
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
            setShowDuplicateItemDialog(true);
          }}
        >
          <ListItemIcon>
            <ContentCopyRounded fontSize="small" />
          </ListItemIcon>
          Duplicate Item
        </MenuItem>
        <MenuItem onClick={() => handleCopyClick(itemZUID)}>
          <ListItemIcon>
            {isCopied ? (
              <CheckRounded fontSize="small" />
            ) : (
              <WidgetsRounded fontSize="small" />
            )}
          </ListItemIcon>
          Copy ZUID
        </MenuItem>
        <MenuItem
          onClick={(event) => {
            setShowApiEndpoints(event.currentTarget);
            setApiEndpointType("quick-access");
          }}
        >
          <ListItemIcon>
            <BoltRounded fontSize="small" />
          </ListItemIcon>
          View Quick Access API
        </MenuItem>
        <MenuItem
          onClick={(event) => {
            setShowApiEndpoints(event.currentTarget);
            setApiEndpointType("site-generators");
          }}
        >
          <ListItemIcon>
            <DataObjectRounded fontSize="small" />
          </ListItemIcon>
          View Site Generators API
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(`/schema/${modelZUID}`);
          }}
        >
          <ListItemIcon>
            <Database fontSize="small" />
          </ListItemIcon>
          Edit Model
        </MenuItem>
        <MenuItem
          onClick={() => {
            history.push(codePath);
          }}
        >
          <ListItemIcon>
            <CodeRounded fontSize="small" />
          </ListItemIcon>
          Edit Template
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <DeleteRounded fontSize="small" />
          </ListItemIcon>
          Delete Item
        </MenuItem>
      </Menu>
      {showDuplicateItemDialog && (
        <DuplicateItemDialog
          onClose={() => setShowDuplicateItemDialog(false)}
        />
      )}
      <Menu
        anchorEl={showApiEndpoints}
        open={!!showApiEndpoints}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() => {
          setShowApiEndpoints(null);
        }}
      >
        <MenuItem
          onClick={() => {
            setShowApiEndpoints(null);
            window.open(
              // @ts-expect-error config not typed
              `${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[apiEndpointType]}`,
              "_blank"
            );
          }}
        >
          <ListItemIcon>
            <DesignServicesRounded fontSize="small" />
          </ListItemIcon>
          <Typography
            variant="inherit"
            noWrap
            sx={{
              width: 172,
            }}
          >
            {/* @ts-expect-error config not typed */}
            {`${instance.randomHashID}${CONFIG.URL_PREVIEW}${apiTypeEndpointMap[apiEndpointType]}`}
          </Typography>
          <Chip size="small" label="Dev" />
        </MenuItem>
        {liveDomain && (
          <MenuItem
            onClick={() => {
              setShowApiEndpoints(null);
              window.open(
                `https://${liveDomain.domain}${
                  apiTypeEndpointMap[
                    apiEndpointType as keyof typeof apiTypeEndpointMap
                  ]
                }`,
                "_blank"
              );
            }}
          >
            <ListItemIcon>
              <VisibilityRounded fontSize="small" />
            </ListItemIcon>
            <Typography
              variant="inherit"
              noWrap
              sx={{
                width: 172,
              }}
            >
              {`${liveDomain.domain}${
                apiTypeEndpointMap[
                  apiEndpointType as keyof typeof apiTypeEndpointMap
                ]
              }`}
            </Typography>
            <Chip size="small" label="Prod" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
