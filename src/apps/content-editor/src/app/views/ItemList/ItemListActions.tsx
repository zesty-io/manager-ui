import {
  Button,
  Box,
  InputAdornment,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
  Chip,
} from "@mui/material";
import { Database, IconButton } from "@zesty-io/material";
import {
  MoreHorizRounded,
  Add,
  Search,
  TableViewRounded,
  CheckRounded,
  CodeRounded,
  WidgetsRounded,
  BoltRounded,
  KeyboardArrowRightRounded,
  DataObjectRounded,
  VisibilityRounded,
  DesignServicesRounded,
} from "@mui/icons-material";
import { forwardRef, useState, useCallback } from "react";
import { useHistory, useParams as useRouterParams } from "react-router";
import { useFilePath } from "../../../../../../shell/hooks/useFilePath";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { debounce } from "lodash";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { useGetDomainsQuery } from "../../../../../../shell/services/accounts";
import { ApiType } from "../../../../../schema/src/app/components/ModelApi";
import { AppState } from "../../../../../../shell/store/types";
import { useSelector } from "react-redux";
import { CascadingMenuItem } from "../../../../../../shell/components/CascadingMenuItem";
import { APIEndpoints } from "../../components/APIEndpoints";

export const ItemListActions = forwardRef((props, ref) => {
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: contentModels } = useGetContentModelsQuery();
  const { data: domains } = useGetDomainsQuery();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const codePath = useFilePath(modelZUID);
  const [isCopied, setIsCopied] = useState(false);
  const [params, setParams] = useParams();
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const instance = useSelector((state: AppState) => state.instance);
  const [showApiEndpoints, setShowApiEndpoints] = useState<null | HTMLElement>(
    null
  );
  const [apiEndpointType, setApiEndpointType] = useState("quick-access");
  const isDataset =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ===
    "dataset";
  const apiTypeEndpointMap: Partial<Record<ApiType, string>> = {
    "quick-access": `/-/instant/${modelZUID}.json`,
    "site-generators": "/?toJSON",
  };
  const liveDomain = domains?.find((domain) => domain.branch == "live");

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);

        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const debouncedSetParams = useCallback(
    debounce((value) => {
      setParams(value, "search");
    }, 300),
    [setParams]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSetParams(value);
  };

  return (
    <Box display="flex" gap={1}>
      <IconButton
        data-cy="MultiPageTableMoreMenu"
        size="small"
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreHorizRounded />
      </IconButton>
      <Menu
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        open={!!anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          data-cy="ImportCSVNavButton"
          onClick={() => {
            history.push(`/content/${modelZUID}/import`);
          }}
        >
          <ListItemIcon>
            <TableViewRounded />
          </ListItemIcon>
          Import CSV
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCopyClick(modelZUID);
          }}
        >
          <ListItemIcon>
            {isCopied ? (
              <CheckRounded />
            ) : (
              <WidgetsRounded
                sx={{
                  height: "20px",
                  width: "20px",
                }}
              />
            )}
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
        {!isDataset && (
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
          data-cy="EditModelNavButton"
          onClick={() => {
            history.push(`/schema/${modelZUID}`);
          }}
        >
          <ListItemIcon>
            <Database />
          </ListItemIcon>
          Edit Model
        </MenuItem>
        {!isDataset && (
          <MenuItem
            data-cy="EditTemplateNavButton"
            onClick={() => {
              history.push(codePath);
            }}
          >
            <ListItemIcon>
              <CodeRounded />
            </ListItemIcon>
            Edit Template
          </MenuItem>
        )}
      </Menu>
      <TextField
        data-cy="MultiPageTableSearchField"
        onChange={handleSearchChange}
        value={searchTerm}
        placeholder="Filter Items"
        variant="outlined"
        size="small"
        inputProps={{
          ref,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
          sx: {
            backgroundColor: "grey.50",
          },
        }}
      />
      <Button
        data-cy="AddItemButton"
        variant="contained"
        color="primary"
        startIcon={<Add />}
        size="small"
        onClick={() => {
          history.push(`/content/${modelZUID}/new`);
        }}
      >
        Create
      </Button>
    </Box>
  );
});
