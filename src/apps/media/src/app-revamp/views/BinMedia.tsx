import { useState } from "react";
import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { Box, CircularProgress } from "@mui/material";
import { FileModal } from "../components/FileModal";
import { NotFoundState } from "../components/NotFoundState";

type Params = { id: string };

export const BinMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const headerHeight = useSelector((state: any) => state.ui.headerHeight);
  const sidebarWidth = useSelector((state: any) => state.ui.sidebarWidth);

  const [toggleFileModal, setToggleFileModal] = useState<boolean>(false);

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
            <DnDProvider>
              {!isFilesFetching && !binFiles?.length ? (
                <EmptyState />
              ) : (
                <MediaGrid
                  files={binFiles}
                  groups={binGroups}
                  toggleFileModal={toggleFileModal}
                  setToggleFileModal={setToggleFileModal}
                  heightOffset={headerHeight + 64}
                  widthOffset={sidebarWidth + 220}
                />
              )}
            </DnDProvider>
          )}
          <FileModal files={binFiles} toggleFileModal={toggleFileModal} />
        </>
      )}
    </Box>
  );
};
