import { memo, useState, useEffect, useRef, useCallback } from "react";
// import { PublishAll } from "./components/PublishAll";
// import { SelectBranch } from "./components/SelectBranch";
import { Stack, Typography, Box, Divider, CssBaseline } from "@mui/material";
import { theme } from "@zesty-io/material";
import { ThemeProvider } from "@mui/material/styles";
import { AppSideBar } from "../../../../../../shell/components/AppSidebar";
import CreateFile from "./CreateFile";
import { FileNodeProps } from "./constants";
import FileNav from "./FileNav";
import { ResizableContainer } from "../../../../../../shell/components/ResizeableContainer";
import OrderFiles from "./OrderFiles";

interface NavCode {
  raw?: FileNodeProps[];
  tree?: FileNodeProps[];
  stylesheetsTree?: FileNodeProps[];
  scriptsTree?: FileNodeProps[];
}

interface SideBarProps {
  navCode: NavCode;
  dispatch: (action: any) => void;
}

const filterTreeData = (
  treeData: FileNodeProps[],
  keyword: string
): FileNodeProps[] => {
  return treeData
    .map((item: FileNodeProps) => {
      const isDir = item?.type === "directory";
      const searchString =
        `${item?.ZUID}|${item?.fileName}|${item?.label}|${item?.path}|${item?.contentModelZUID}|${item?.contentModelType}`
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
}: SideBarProps) {
  const sideBarChildrenContainerRef = useRef(null);

  const [htmlFiles, setHtmlFiles] = useState([]);
  const [cssFiles, setCssFiles] = useState([]);
  const [jsFiles, setJsFiles] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [fileType, setFileType] = useState("");
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isOrderFilesOpen, setIsOrderFilesOpen] = useState(false);

  const openCreateFileDialog = useCallback(
    (fileType?: string) => {
      setFileType(fileType);
      setIsCreateFileOpen(true);
    },
    [dispatch]
  );

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
          searchPlaceholder="Filter Models"
          ref={sideBarChildrenContainerRef}
          // subMenus={SUB_MENUS}
          onAddClick={() => setIsCreateFileOpen(true)}
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
                height: "calc(100vh - 36px - 110px)",
                position: "relative",
              }}
            >
              <FileNav
                id="html"
                group="views"
                header="HTML"
                toolTip="HTML"
                tree={htmlFiles}
                createFile={() => openCreateFileDialog("snippet")}
                orderFiles={() => openOrderFilesDialog("snippet")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="css"
                group="stylesheets"
                header="SITE.CSS"
                toolTip="Site.css is a dynamically created file from the instance stylesheet files"
                tree={cssFiles}
                createFile={() => openCreateFileDialog("text/css")}
                orderFiles={() => openOrderFilesDialog("text/css")}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="js"
                group="scripts"
                header="SITE.JS"
                toolTip="Site.js is a dynamically created file from the instance JavaScript files"
                tree={jsFiles}
                createFile={() => openCreateFileDialog("text/javascript")}
                orderFiles={() => openOrderFilesDialog("text/javascript")}
              />
            </Box>
          )}
        </AppSideBar>
      </ResizableContainer>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <CreateFile
          open={isCreateFileOpen}
          onClose={() => {
            setFileType("");
            setIsCreateFileOpen(false);
          }}
          defaultType={fileType}
        />
        <OrderFiles
          type={fileType}
          isOpen={isOrderFilesOpen}
          onClose={() => {
            setFileType("");
            setIsOrderFilesOpen(false);
          }}
        />
      </ThemeProvider>
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
