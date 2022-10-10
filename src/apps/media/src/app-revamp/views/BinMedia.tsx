import { useState } from "react";
import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { UploadModal } from "../components/UploadModal";
import { Box, CircularProgress } from "@mui/material";
import { FileModal } from "../components/FileModal";
import { NotFoundState } from "../components/NotFoundState";

type Params = { id: string };

export const BinMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);

  // current file details used for file modal
  const [currentFile, setCurrentFile] = useState<any>({
    id: "",
    src: "",
    filename: "",
  });

  const {
    data: binData,
    isFetching: isBinDataFetching,
    isError,
  } = mediaManagerApi.useGetBinQuery(id);

  const { data: binGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id);

  const { data: binFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id);

  const handleCloseModal = () => {
    setCurrentFile((prev: any) => ({
      ...prev,
      id: "",
    }));
  };

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isError ? (
        <NotFoundState />
      ) : (
        <>
          <Header
            title={binData?.[0]?.name}
            id={binData?.[0]?.id}
            binId={binData?.[0]?.id}
          />
          {isGroupsFetching || isFilesFetching ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <UploadModal />
              /* TODO FIX THIS */
              <DnDProvider currentBinId={id} currentGroupId="">
                {!isFilesFetching && !binFiles?.length ? (
                  /*TODO fix this*/
                  <EmptyState currentBinId={id} currentGroupId="" />
                ) : (
                  <MediaGrid
                    files={binFiles}
                    groups={binGroups}
                    heightOffset={headerHeight + 64}
                    widthOffset={sidebarWidth + 220}
                    onSetCurrentFile={setCurrentFile}
                  />
                )}
              </DnDProvider>
            </>
          )}
          {currentFile.id && (
            <FileModal
              id={currentFile.id}
              src={currentFile.src}
              filename={currentFile.filename}
              title={currentFile.filename}
              handleCloseModal={handleCloseModal}
            />
          )}
        </>
      )}
    </Box>
  );
};
