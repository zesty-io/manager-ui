import { memo, useState, useCallback, useMemo } from "react";
import { Stack, Typography, Box, Divider } from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";
import { ResizableContainer } from "../../../../../../shell/components/ResizeableContainer";

import FileNav from "./FileNav";
import OrderFiles from "./OrderFiles";
import { FileNodeProps } from "../constants";

interface NavCode {
  raw?: FileNodeProps[];
  tree?: FileNodeProps[];
  stylesheetsTree?: FileNodeProps[];
  scriptsTree: FileNodeProps[];
}

type NavType = "view" | "script" | "stylesheet" | "file";

interface SideBarProps {
  navCode: NavCode;
  dispatch: (action: any) => void;
  openCreateFileDialog: (type: string, nav: NavType) => void;
}

const SUB_MENUS: SubMenu[] = [
  {
    name: "All Files",
    icon: FileCopyIcon,
    path: "/code",
  },
];

const filterTreeData = (
  treeData: FileNodeProps[] = [],
  keyword: string = ""
): FileNodeProps[] => {
  const normalizedKeyword = keyword.toLowerCase().trim();
  return treeData
    .map((item) => {
      const isDir = item?.type === "directory";
      const searchString = [
        item?.ZUID,
        item?.fileName,
        item?.label,
        item?.path,
        item?.contentModelZUID,
        item?.contentModelType,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();

      const isFound = searchString.includes(normalizedKeyword);
      if (!isDir && !isFound) return null;
      const itemChildren = filterTreeData(item?.children, keyword);
      if (isDir && !itemChildren?.length && !isFound) return null;
      return {
        ...item,
        children: itemChildren || [],
      };
    })
    .filter(Boolean);
};

const byLabel = (a: FileNodeProps, b: FileNodeProps) =>
  a.label.toLowerCase().localeCompare(b.label.toLowerCase());
const byOrder = (a: FileNodeProps, b: FileNodeProps) =>
  (a.sort ?? 0) - (b.sort ?? 0);

export const SideBar = memo(function SideBar({
  navCode,
  openCreateFileDialog,
}: SideBarProps) {
  const [keyword, setKeyword] = useState("");
  const [fileType, setFileType] = useState("");
  const [isOrderFilesOpen, setIsOrderFilesOpen] = useState(false);

  const { views, styleSheets, scripts } = useMemo(() => {
    if (!navCode) return { views: [], styleSheets: [], scripts: [] };
    return {
      views: filterTreeData(navCode.tree, keyword).sort(byLabel),
      styleSheets: filterTreeData(navCode.stylesheetsTree, keyword).sort(
        byOrder
      ),
      scripts: filterTreeData(navCode.scriptsTree, keyword).sort(byOrder),
    };
  }, [navCode, keyword]);
  const openOrderFilesDialog = useCallback((type?: string) => {
    setFileType(type);
    setIsOrderFilesOpen(true);
  }, []);

  const closeOrderFilesDialog = useCallback(() => {
    setFileType("");
    setIsOrderFilesOpen(false);
  }, []);
  const hasResults = views.length + styleSheets.length + scripts.length > 0;

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
          {hasResults ? (
            <Box
              sx={{
                overflow: "hidden auto",
                width: "100%",
                height: "calc(100vh - 185px)", // Adjusted height calculation
              }}
            >
              <FileNav
                id="html"
                group="views"
                header="VIEWS"
                toolTip="Views are template files that can render HTML or various other MIME types."
                tree={views}
                createFile={() => openCreateFileDialog?.("snippet", "view")}
                orderFiles={() => openOrderFilesDialog("snippet")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="css"
                group="stylesheets"
                header="SITE.CSS"
                toolTip="Site.css is a dynamically created file from the instance stylesheet files"
                tree={styleSheets}
                createFile={() =>
                  openCreateFileDialog?.("text/css", "stylesheet")
                }
                orderFiles={() => openOrderFilesDialog("text/css")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="js"
                group="scripts"
                header="SITE.JS"
                toolTip="Site.js is a dynamically created file from the instance JavaScript files"
                tree={scripts}
                createFile={() =>
                  openCreateFileDialog?.("text/javascript", "script")
                }
                orderFiles={() => openOrderFilesDialog("text/javascript")}
              />
            </Box>
          ) : (
            <NoResults keyword={keyword} />
          )}
        </AppSideBar>
      </ResizableContainer>
      <OrderFiles
        type={fileType}
        isOpen={isOrderFilesOpen}
        onClose={closeOrderFilesDialog}
      />
    </>
  );
});

const NoResults = ({ keyword }: { keyword: string }) => (
  <Stack gap={1.5} alignItems="center" justifyContent="center" p={1.5}>
    <img
      src="/noSearchResults.svg"
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
