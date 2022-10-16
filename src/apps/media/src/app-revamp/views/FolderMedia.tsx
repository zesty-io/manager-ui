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

export const FolderMedia = ({ addImagesCallback }: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);

  const {
    data: groupData,
    isFetching,
    isError,
  } = mediaManagerApi.useGetGroupDataQuery(id);

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
            title={groupData?.name}
            id={groupData?.id}
            binId={groupData?.bin_id}
            groupId={groupData?.group_id}
            addImagesCallback={addImagesCallback}
          />
          {isFetching ? (
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
              <DnDProvider
                currentBinId={groupData.bin_id}
                currentGroupId={groupData.id}
              >
                {!isFetching && !groupData.files?.length ? (
                  <EmptyState
                    currentBinId={groupData.bin_id}
                    currentGroupId={groupData.id}
                  />
                ) : (
                  <MediaGrid
                    files={groupData?.files}
                    groups={groupData?.groups}
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
