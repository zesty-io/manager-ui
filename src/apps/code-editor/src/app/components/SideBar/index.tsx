import { memo, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Stack, Typography, Box, Divider } from "@mui/material";
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

type NavType = "view" | "script" | "stylesheet" | "file";

interface SideBarProps {
  navCode: NavCode;
  dispatch: (action: any) => void;
  isLoading?: boolean;
}

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
  isLoading,
}: SideBarProps) {
  const sideBarChildrenContainerRef = useRef(null);

  const [keyword, setKeyword] = useState("");
  const [fileType, setFileType] = useState("");
  const [navType, setNavType] = useState<NavType | null>(null);
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isOrderFilesOpen, setIsOrderFilesOpen] = useState(false);

  const openCreateFileDialog = useCallback(
    (type?: string, nav?: NavType) => {
      setFileType(type);
      setNavType(nav);
      setIsCreateFileOpen(true);
    },
    [dispatch]
  );

  const openOrderFilesDialog = useCallback(
    (fileType?: string, nav?: NavType) => {
      setFileType(fileType);
      setIsOrderFilesOpen(true);
    },
    [dispatch]
  );

  const navData = useMemo(() => {
    if (!navCode) return null;

    return {
      htmlFiles: navCode?.tree?.sort((a, b) => byLabel(a, b)),
      cssFiles: navCode?.stylesheetsTree?.sort((a, b) => byLabel(a, b)),
      jsFiles: navCode?.scriptsTree?.sort((a, b) => byLabel(a, b)),
    };
  }, [navCode]);

  const filteredNavData = useMemo(() => {
    if (!keyword) return navData;

    return {
      htmlFiles: filterTreeData(navData?.htmlFiles, keyword),
      cssFiles: filterTreeData(navData?.cssFiles, keyword),
      jsFiles: filterTreeData(navData?.jsFiles, keyword),
    };
  }, [navData, keyword]);

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
          onAddClick={() => openCreateFileDialog("snippet", "file")}
          onFilterChange={(keyword) => setKeyword(keyword)}
          titleButtonTooltip="Create File"
          hideSubMenuOnSearch={false}
        >
          {filteredNavData?.htmlFiles?.length +
            filteredNavData?.cssFiles?.length +
            filteredNavData?.jsFiles?.length <
          1 ? (
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
                height: "calc(100vh - 36px - 113px)",
                position: "relative",
              }}
            >
              <FileNav
                id="html"
                group="views"
                header="VIEWS"
                toolTip="Views are template files that can render HTML or various other MIME types."
                tree={filteredNavData?.htmlFiles || []}
                createFile={() => openCreateFileDialog("snippet", "view")}
                orderFiles={() => openOrderFilesDialog("snippet", "view")}
                isLoading={!filteredNavData?.htmlFiles?.length && isLoading}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="css"
                group="stylesheets"
                header="SITE.CSS"
                toolTip="Site.css is a dynamically created file from the instance stylesheet files"
                tree={filteredNavData?.cssFiles || []}
                createFile={() =>
                  openCreateFileDialog("text/css", "stylesheet")
                }
                orderFiles={() =>
                  openOrderFilesDialog("text/css", "stylesheet")
                }
                isLoading={!filteredNavData?.cssFiles?.length && isLoading}
              />

              <Divider sx={{ my: 1, border: "none" }} />
              <FileNav
                id="js"
                group="scripts"
                header="SITE.JS"
                toolTip="Site.js is a dynamically created file from the instance JavaScript files"
                tree={filteredNavData?.jsFiles || []}
                createFile={() =>
                  openCreateFileDialog("text/javascript", "script")
                }
                orderFiles={() =>
                  openOrderFilesDialog("text/javascript", "script")
                }
                isLoading={!filteredNavData?.jsFiles?.length && isLoading}
              />
            </Box>
          )}
        </AppSideBar>
      </ResizableContainer>
      <CreateFile
        open={isCreateFileOpen}
        onClose={() => {
          setFileType(null);
          setNavType(null);
          setIsCreateFileOpen(false);
        }}
        defaultType={fileType}
        title={`Create ${navType}`}
      />
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
