import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";

const HEADER_HEIGHT = 43;
const SIDEBAR_WIDTH = 400;

export const AllMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins, isLoading: isBinsLoading } =
    mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: files, isLoading: isFilesLoading } =
    mediaManagerApi.useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );
  const { data: groups, isLoading: isGroupsLoading } =
    mediaManagerApi.useGetBinGroupsQuery(bins?.[0]?.id, {
      skip: !bins?.length,
    });

  if (isFilesLoading || isGroupsLoading || isBinsLoading) {
    return <div>Loading...</div>;
  }

  if (files?.length === 0) {
    return <EmptyState />;
  }

  // TODO: Don't pass groups in this All Media view (currently passed for testing)
  return (
    <MediaGrid
      files={files}
      groups={groups}
      heightOffset={HEADER_HEIGHT}
      widthOffset={SIDEBAR_WIDTH}
    />
  );
};
