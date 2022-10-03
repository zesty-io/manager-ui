import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { Box, CircularProgress } from "@mui/material";

type Params = { id: string };

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const BinMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const openNav = useSelector((state: any) => state.ui.openNav);

  const { data: binData, isFetching: isBinDataFetching } =
    mediaManagerApi.useGetBinQuery(id);

  // TODO potentially provide user feedback for an invalid id
  const { data: binGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id);

  const { data: binFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
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
              heightOffset={HEADER_HEIGHT}
              widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
            />
          )}
        </DnDProvider>
      )}
    </Box>
  );
};
