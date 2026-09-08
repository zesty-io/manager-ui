import { useState, useCallback, useMemo, FC } from "react";
import {
  Stack,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { ResizableContainer } from "../../../../../../shell/components/ResizeableContainer";

import FileNav from "./FileNav";
import OrderFiles from "./OrderFiles";
import { FileNodeProps } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { TreeItem } from "../../../../../../shell/components/NavTree";
import { fetchFiles, publishFile } from "../../../store/files";
import { fetchAuditTrail } from "../../../store/auditTrail";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import { usePermission } from "../../../../../../shell/hooks/use-permissions";

type NavType = "view" | "script" | "stylesheet" | "file";

interface SideBarProps {
  isLoading?: boolean;
  openCreateFileDialog: (type: string, nav: NavType) => void;
}

export type TreeDataProps = {
  tree: TreeItem[];
  dir: string[];
};

const SUB_MENUS: SubMenu[] = [
  {
    name: "All Files",
    icon: FileCopyIcon,
    path: "/code",
    dataCy: "codeNavAllFiles",
  },
];

const byLabel = (a: FileNodeProps, b: FileNodeProps) =>
  a.label.toLowerCase().localeCompare(b.label.toLowerCase());
const byOrder = (a: FileNodeProps, b: FileNodeProps) =>
  (a.sort ?? 0) - (b.sort ?? 0);

const ActionsButton = ({
  ZUID,
  status,
  fileType,
}: {
  ZUID: string;
  status: string;
  fileType: string;
}) => {
  const dispatch: Awaited<any> = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <IconButton
      data-cy="PublishIconButton"
      key="publish"
      color="inherit"
      size="xxsmall"
      onClick={() => {
        setIsLoading(true);
        dispatch(publishFile(ZUID, status))
          .then(() => {
            dispatch(fetchFiles(fileType));
            dispatch(fetchAuditTrail(ZUID));
          })
          .finally(() => {
            setIsLoading(false);
          });
      }}
    >
      {isLoading ? (
        <CircularProgress size="16px" />
      ) : (
        <CloudUploadRoundedIcon
          sx={{
            fontSize: 16,
            color: (theme) => `${theme.palette.grey[500]}!important`,
          }}
        />
      )}
    </IconButton>
  );
};

export type TreeItemProps = {
  tree: FileNodeProps[];
  dir: string[];
};

const createTreeData = (
  tree: FileNodeProps[],
  group: string,
  canPublish: boolean
): TreeDataProps => {
  const dirList: string[] = [];
  const createTreeItemData = (treeItem: FileNodeProps): TreeItem => {
    const {
      path,
      icon,
      label,
      type,
      isLive,
      version,
      publishedVersion,
      children,
      ...treeData
    } = treeItem;
    const isDir: boolean = type === "directory";
    const itemLocation: string = `/code/file/${group}`;
    const itemPath: string = path?.trim()?.replace(/^\/+/, "");

    const filePath: string = isDir
      ? `${itemLocation}/${itemPath}`
      : `/${itemPath}`;

    if (isDir) dirList.push(filePath);

    const actions =
      canPublish &&
      !treeItem.isLive &&
      treeItem?.version > treeItem?.publishedVersion
        ? [
            <ActionsButton
              key="publish"
              ZUID={treeItem?.ZUID}
              status={treeItem?.status}
              fileType={group}
            />,
          ]
        : [];

    return {
      ZUID: treeItem?.ZUID,
      icon: treeItem?.icon,
      path: filePath,
      label: treeItem?.label,
      children: treeItem?.children?.map((child) => createTreeItemData(child)),
      actions: actions,
      nodeData: { navSource: "code", isDir },
    };
  };
  const treeData = tree
    ?.sort(group === "views" ? byLabel : byOrder)
    ?.map((item) => createTreeItemData(item));
  return { tree: treeData, dir: dirList };
};

export const SideBar: FC<SideBarProps> = ({
  isLoading,
  openCreateFileDialog,
}) => {
  const canPublish = usePermission("PUBLISH");
  const [keyword, setKeyword] = useState("");
  const [fileType, setFileType] = useState("");
  const [isOrderFilesOpen, setIsOrderFilesOpen] = useState(false);

  const navCode = useSelector((state: AppState) => state?.navCode);

  const { views, styleSheets, scripts } = useMemo(() => {
    return {
      views: createTreeData(navCode.tree, "views", canPublish),
      styleSheets: createTreeData(
        navCode.stylesheetsTree,
        "stylesheets",
        canPublish
      ),
      scripts: createTreeData(navCode.scriptsTree, "scripts", canPublish),
    };
  }, [navCode]);

  const openOrderFilesDialog = useCallback((type?: string) => {
    setFileType(type);
    setIsOrderFilesOpen(true);
  }, []);

  const closeOrderFilesDialog = useCallback(() => {
    setFileType("");
    setIsOrderFilesOpen(false);
  }, []);

  return (
    <>
      <ResizableContainer
        id="codeAppNav"
        defaultWidth={220}
        minWidth={220}
        maxWidth={360}
      >
        <AppSideBar
          data-cy="codeNav"
          mode="dark"
          headerTitle="Code"
          searchPlaceholder="Filter Files"
          subMenus={SUB_MENUS}
          onAddClick={() => openCreateFileDialog?.("snippet", "file")}
          onFilterChange={setKeyword}
          titleButtonTooltip="Create File"
          hideSubMenuOnSearch={false}
        >
          <Box
            sx={{
              overflow: "hidden auto",
              width: "100%",
              height: "calc(100vh - 185px)", // Adjusted height calculation
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              rowGap: 2,
              position: "relative",
              "& + .no-results-container": {
                display: "none",
              },
              "&:empty": {
                display: "none",
                "& + .no-results-container": {
                  display: "block",
                },
              },
            }}
          >
            <FileNav
              id="html"
              group="views"
              header="VIEWS"
              toolTip="Views are template files that can render HTML or various other MIME types."
              tree={views?.tree}
              dirList={views?.dir}
              createFile={() => openCreateFileDialog?.("snippet", "view")}
              orderFiles={() => openOrderFilesDialog("snippet")}
              searchTerm={keyword}
              isLoading={isLoading}
            />
            <FileNav
              id="css"
              group="stylesheets"
              header="SITE.CSS"
              toolTip="Site.css is a dynamically created file from the instance stylesheet files"
              tree={styleSheets?.tree}
              dirList={styleSheets?.dir}
              createFile={() =>
                openCreateFileDialog?.("text/css", "stylesheet")
              }
              orderFiles={() => openOrderFilesDialog("text/css")}
              searchTerm={keyword}
              isLoading={isLoading}
            />
            <FileNav
              id="js"
              group="scripts"
              header="SITE.JS"
              toolTip="Site.js is a dynamically created file from the instance JavaScript files"
              tree={scripts?.tree}
              dirList={scripts?.dir}
              createFile={() =>
                openCreateFileDialog?.("text/javascript", "script")
              }
              orderFiles={() => openOrderFilesDialog("text/javascript")}
              searchTerm={keyword}
              isLoading={isLoading}
            />
          </Box>
          <Box className="no-results-container">
            <NoResults keyword={keyword} />
          </Box>
        </AppSideBar>
      </ResizableContainer>
      <OrderFiles
        type={fileType}
        isOpen={isOrderFilesOpen}
        onClose={closeOrderFilesDialog}
      />
    </>
  );
};

const NoResults = ({ keyword }: { keyword: string }) => (
  <Stack gap={1.5} alignItems="center" justifyContent="center" p={1.5}>
    <img
      src="/images/noSearchResults.svg"
      alt="No search results"
      width="70"
      height="64"
      loading="lazy"
    />
    <Typography color="text.secondary" variant="body2" align="center">
      {keyword ? `No results for "${keyword}"` : "No files found"}
    </Typography>
  </Stack>
);

export default SideBar;
