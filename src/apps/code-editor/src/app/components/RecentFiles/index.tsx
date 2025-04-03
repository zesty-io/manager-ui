import { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";

import { TopBar } from "./TopBar";
import { FileList, FileProps } from "./FileList";
import { DevResources } from "./DevResources";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { NavCodeTypes } from "../constants";

type RecentFilesProps = {
  openCreateFileDialog: (
    type: string,
    nav: "view" | "stylesheet" | "script" | "file"
  ) => void;
};

export const RecentFiles = ({ openCreateFileDialog }: RecentFilesProps) => {
  const searchInputRef = useRef(undefined);
  const files = useSelector((state: AppState) => state?.navCode?.raw);
  const [recentFiles, setRecentFiles] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    if (!files?.length) return;

    const sortedFiles: FileProps[] = files
      ?.sort(
        (a: NavCodeTypes, b: NavCodeTypes) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      ?.map((file: NavCodeTypes) => ({
        icon: file?.icon,
        fileName: file?.fileName,
        lastSaved: file?.updatedAt,
        fileType: file?.fileType,
        type: file?.type,
        ZUID: file?.ZUID,
        path: file?.path,
      }));

    setRecentFiles(sortedFiles);
  }, [files, searchKeyword]);

  return (
    <>
      <Box
        width="100%"
        height="84px"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="background.editor"
        color="grey.300"
        borderBottom="1px solid"
        borderColor="grey.800"
        px={4}
        pb={2}
        pt={4}
      >
        <TopBar
          searchKeyword={searchKeyword}
          setSearchKeyword={(text: string) => setSearchKeyword(text)}
          searchInputRef={searchInputRef}
          openCreateFileDialog={() => openCreateFileDialog("snippet", "file")}
        />
      </Box>

      <Box
        width="100%"
        height="calc(100% - 84px)"
        maxHeight="calc(100% - 84px)"
        minHeight="calc(100% - 84px)"
        bgcolor="background.editor"
        color="grey.300"
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        columnGap={4}
        px={4}
        py={3}
      >
        <Box flexGrow={1} height="100%" position="relative">
          <FileList
            files={recentFiles}
            searchKeyword={searchKeyword}
            searchInputRef={searchInputRef}
            setSearchKeyword={(text: string) => setSearchKeyword(text)}
          />
        </Box>
        <Box
          flexGrow={0}
          sx={{
            width: "320px",
            minWidth: "320px",
            maxWidth: "320px",
          }}
        >
          <DevResources />
        </Box>
      </Box>
    </>
  );
};
