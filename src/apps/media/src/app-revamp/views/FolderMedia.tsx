import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";

type Params = { id: string };

const HEADER_HEIGHT = 43;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const FolderMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const openNav = useSelector((state: any) => state.ui.openNav);

  // TODO potentially provide user feedback for an invalid id
  const { data: groupData, isFetching } =
    mediaManagerApi.useGetGroupDataQuery(id);

  if (isFetching) return <div>Loading...</div>;

  if (!isFetching && !groupData.files?.length)
    return (
      <>
        <DnDProvider>
          <EmptyState />
        </DnDProvider>
      </>
    );

  return (
    <DnDProvider>
      <MediaGrid
        files={groupData.files}
        groups={groupData.groups}
        heightOffset={HEADER_HEIGHT}
        widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
      />
    </DnDProvider>
  );
};
