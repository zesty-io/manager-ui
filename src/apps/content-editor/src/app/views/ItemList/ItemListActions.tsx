import {
  Button,
  Box,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  CircularProgress,
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
  FileDownloadRounded,
} from "@mui/icons-material";
import { forwardRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams as useRouterParams } from "react-router";
import { useFilePath } from "../../../../../../shell/hooks/useFilePath";
import { useParams } from "../../../../../../shell/hooks/useParams";
import { debounce } from "lodash";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { CascadingMenuItem } from "../../../../../../shell/components/CascadingMenuItem";
import { APIEndpoints } from "../../components/APIEndpoints";
import { useLazyDownloadCsvQuery } from "../../../../../../shell/services/cloudFunctions";
import { useDispatch } from "react-redux";
import { searchItems } from "../../../../../../shell/store/content";
import SearchBox from "../../../../../../shell/components/SearchBox";

export const ItemListActions = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modelZUID } = useRouterParams<{ modelZUID: string }>();
  const { data: contentModels } = useGetContentModelsQuery();
  const history = useHistory();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  const codePath = useFilePath(modelZUID);
  const [isCopied, setIsCopied] = useState(false);
  const [params, setParams] = useParams();
  const [searchTerm, setSearchTerm] = useState(params.get("search") || "");
  const isDataset =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ===
    "dataset";
  const [downloadCSV, { isLoading: isDownloadCsvLoading }] =
    useLazyDownloadCsvQuery();

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
      dispatch(searchItems(value));
    }, 500),
    [setParams, dispatch, searchItems]
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
          {t("content.itemListImportCsv")}
        </MenuItem>
        <MenuItem
          data-cy="DownloadCSVNavButton"
          onClick={() => downloadCSV({ modelZUID })}
        >
          <ListItemIcon>
            {isDownloadCsvLoading ? (
              <CircularProgress size="24px" />
            ) : (
              <FileDownloadRounded />
            )}
          </ListItemIcon>
          {t("content.itemListExportCsv")}
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
        {!isDataset && (
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
          data-cy="EditModelNavButton"
          onClick={() => {
            history.push(`/schema/${modelZUID}`);
          }}
        >
          <ListItemIcon>
            <Database />
          </ListItemIcon>
          {t("content.itemListEditModel")}
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
            {t("content.itemListEditTemplate")}
          </MenuItem>
        )}
      </Menu>
      <SearchBox
        data-cy="MultiPageTableSearchField"
        onChange={handleSearchChange}
        value={searchTerm}
        placeholder={t("content.itemListFilterPlaceholder")}
        variant="outlined"
        size="small"
        inputRef={ref}
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
        sx={{
          width: "205px",
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
        {t("common.create")}
      </Button>
    </Box>
  );
});

ItemListActions.displayName = "ItemListActions";
