import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";

type Params = { id: string };

const HEADER_HEIGHT = 43;
const SIDEBAR_COLLAPSED_WIDTH = 282;
const SIDEBAR_WIDTH = 377;

export const BinMedia = () => {
  const params = useParams<Params>();
  const { id } = params;
  const openNav = useSelector((state: any) => state.ui.openNav);

  // TODO potentially provide user feedback for an invalid id
  const { data: binGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id);
  const { data: binFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id);

  if (isGroupsFetching || isFilesFetching) return <div>Loading...</div>;

  if (!isFilesFetching && !binFiles?.length) return <EmptyState />;

  return (
    <MediaGrid
      files={binFiles}
      groups={binGroups}
      heightOffset={HEADER_HEIGHT}
      widthOffset={openNav ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}
    />
  );
};
