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
import { NotFoundState } from "../components/NotFoundState";
import { File } from "../../../../../shell/services/types";

type Params = { id: string };

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const BinMedia = ({ addImagesCallback }: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);
  const [isInvalidFileId, setIsInvalidFileId] = useState<boolean>(false);

  const {
    data: binData,
    isFetching: isBinDataFetching,
    isError,
  } = mediaManagerApi.useGetBinQuery(id);

  const { data: binGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id);

  const { data: binFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isError || isInvalidFileId ? (
        <NotFoundState />
      ) : (
        <>
          <Header
            title={binData?.[0]?.name}
            id={binData?.[0]?.id}
            binId={binData?.[0]?.id}
            addImagesCallback={addImagesCallback}
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
                  />
                )}
              </DnDProvider>
            </>
          )}
        </>
      )}
    </Box>
  );
};
