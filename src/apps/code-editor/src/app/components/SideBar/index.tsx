import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Stack, Typography, Box, Divider } from "@mui/material";
import {
  AppSideBar,
  SubMenu,
} from "../../../../../../shell/components/AppSidebar";

import FileNav from "./FileNav";
import { ResizableContainer } from "../../../../../../shell/components/ResizeableContainer";
import OrderFiles from "./OrderFiles";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { FileNodeProps } from "../constants";

interface NavCode {
  raw?: FileNodeProps[];
  tree?: FileNodeProps[];
  stylesheetsTree?: FileNodeProps[];
  scriptsTree?: FileNodeProps[];
}

type NavType = "view" | "script" | "stylesheet" | "file";

interface SideBarProps {
  navCode: NavCode;
  dispatch: (action: any) => void;
  openCreateFileDialog?: (type: string, nav: NavType) => void;
}

const SUB_MENUS: SubMenu[] = [
  {
    name: "All Files",
    icon: FileCopyIcon,
    path: "/code",
  },
];

const filterTreeData = (
  treeData: FileNodeProps[],
  keyword: string
): FileNodeProps[] => {
  return treeData
    .map((item: FileNodeProps) => {
      const isDir = item?.type === "directory";
      const searchString =
        `${item?.ZUID}\n${item?.fileName}\n${item?.label}\n${item?.path}\n${item?.contentModelZUID}\n${item?.contentModelType}`
          ?.toLowerCase()
          ?.trim();
      const isFound: boolean = searchString.includes(keyword);
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

export const SideBar = memo(function SideBar({
  navCode,
  dispatch,
  openCreateFileDialog,
}: SideBarProps) {
  const sideBarChildrenContainerRef = useRef(null);

  const [htmlFiles, setHtmlFiles] = useState([]);
  const [cssFiles, setCssFiles] = useState([]);
  const [jsFiles, setJsFiles] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [fileType, setFileType] = useState("");
  const [isOrderFilesOpen, setIsOrderFilesOpen] = useState(false);

  const openOrderFilesDialog = useCallback(
    (fileType?: string) => {
      setFileType(fileType);
      setIsOrderFilesOpen(true);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!navCode) return;
    const parsedHtmlFiles = filterTreeData(navCode?.tree, keyword);
    const parsedCssFiles = filterTreeData(navCode?.stylesheetsTree, keyword);
    const parsedJsFiles = filterTreeData(navCode?.scriptsTree, keyword);
    setHtmlFiles([...parsedHtmlFiles]?.sort((a, b) => byLabel(a, b)));
    setCssFiles([...parsedCssFiles]?.sort((a, b) => byOrder(a, b)));
    setJsFiles([...parsedJsFiles]?.sort((a, b) => byOrder(a, b)));
  }, [navCode, keyword]);

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
          ref={sideBarChildrenContainerRef}
          onAddClick={() => openCreateFileDialog("snippet", "file")}
          onFilterChange={(keyword) => setKeyword(keyword)}
          titleButtonTooltip="Create File"
          hideSubMenuOnSearch={false}
        >
          {htmlFiles?.length + cssFiles?.length + jsFiles?.length < 1 ? (
            <Stack
              gap={1.5}
              alignItems="center"
              justifyContent="center"
              p={1.5}
            >
              <img
                src="/noSearchResults.svg"
                alt="No search results"
                width="70px"
                height="64px"
              />
              <Typography color="text.secondary" variant="body2" align="center">
                No results available for "{keyword}"
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                overflowX: "hidden",
                overflowY: "auto",
                width: "100%",
                height: "calc(100vh - 36px - 113px - 36px)",
                position: "relative",
              }}
            >
              <FileNav
                id="html"
                group="views"
                header="VIEWS"
                toolTip="Views are template files that can render HTML or various other MIME types."
                tree={htmlFiles}
                createFile={() => openCreateFileDialog("snippet", "view")}
                orderFiles={() => openOrderFilesDialog("snippet")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="css"
                group="stylesheets"
                header="SITE.CSS"
                toolTip="Site.css is a dynamically created file from the instance stylesheet files"
                tree={cssFiles}
                createFile={() =>
                  openCreateFileDialog("text/css", "stylesheet")
                }
                orderFiles={() => openOrderFilesDialog("text/css")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="js"
                group="scripts"
                header="SITE.JS"
                toolTip="Site.js is a dynamically created file from the instance JavaScript files"
                tree={jsFiles}
                createFile={() =>
                  openCreateFileDialog("text/javascript", "script")
                }
                orderFiles={() => openOrderFilesDialog("text/javascript")}
              />
            </Box>
          )}
        </AppSideBar>
      </ResizableContainer>

      <OrderFiles
        type={fileType}
        isOpen={isOrderFilesOpen}
        onClose={() => {
          setFileType(null);
          setIsOrderFilesOpen(false);
        }}
      />
    </>
  );
});

const byLabel = (a: FileNodeProps, b: FileNodeProps) => {
  return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
};

const byOrder = (a: FileNodeProps, b: FileNodeProps) => {
  return (a.sort ?? 0) - (b.sort ?? 0);
};

export default SideBar;
