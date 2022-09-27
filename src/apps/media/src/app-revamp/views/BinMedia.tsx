import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { UploadModal } from "../components/UploadModal";
import { Box } from "@mui/material";

type Params = { id: string };

const HEADER_HEIGHT = 43;
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
    <Box component="main" sx={{ flex: 1 }}>
      <Header
        title={binData?.[0]?.name}
        id={binData?.[0]?.id}
        binId={binData?.[0]?.id}
      />
      <DnDProvider>
        {!isFilesFetching && !binFiles?.length ? (
          <EmptyState />
        ) : (
          <>
            <UploadModal />
            <MediaGrid
              files={binFiles}
              groups={binGroups}
              heightOffset={HEADER_HEIGHT}
              widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
            />
          </>
        )}
      </DnDProvider>
    </Box>
  );
};
