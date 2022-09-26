import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";

const HEADER_HEIGHT = 140;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const AllMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const openNav = useSelector((state: any) => state.ui.openNav);
  const { data: bins, isLoading: isBinsLoading } =
    mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: files, isLoading: isFilesLoading } =
    mediaManagerApi.useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );

  return (
    <Box component="main" sx={{ flex: 1 }}>
      <Header title="All Media" />
      {(isFilesLoading || isBinsLoading) && !files?.length ? (
        <EmptyState />
      ) : (
        <MediaGrid
          files={files}
          heightOffset={HEADER_HEIGHT}
          widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
        />
      )}
    </Box>
  );
};
