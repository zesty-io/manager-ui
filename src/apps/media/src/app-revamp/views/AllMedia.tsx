import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import { EmptyState } from "../components/EmptyState";

export const AllMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: files } = mediaManagerApi.useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  console.log("ALL MEDIA FILES", files);

  //if (files?.length === 0) {
  return <EmptyState />;
  //}
  return <div>All Media</div>;
};
