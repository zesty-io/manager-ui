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

export const FolderMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const openNav = useSelector((state: any) => state.ui.openNav);

  // TODO potentially provide user feedback for an invalid id
  const { data: groupData, isFetching: groupIsFetching } =
    mediaManagerApi.useGetGroupDataQuery(id);

  /*
  if(groupData) {
    const { data: binData, isFetching: binIsFetching } =
      mediaManagerApi.useGetBinQuery(groupData.bin_id)
      console.log({binData})
  }
  */

  return (
    <Box component="main" sx={{ flex: 1 }}>
      <Header
        title={groupData?.name}
        id={groupData?.id}
        binId={groupData?.bin_id}
        groupId={groupData?.group_id}
      />
      {/* TODO FIX THIS */}
      <DnDProvider currentBin={null} currentGroup={groupData}>
        {!groupIsFetching && !groupData.files?.length ? (
          <EmptyState />
        ) : (
          <>
            <UploadModal />
            <MediaGrid
              files={groupData?.files}
              groups={groupData?.groups}
              heightOffset={HEADER_HEIGHT}
              widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
            />
          </>
        )}
      </DnDProvider>
    </Box>
  );
};
