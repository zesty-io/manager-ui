import { useSelector } from "react-redux";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";

export const AllMedia = () => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const { data: bins } = mediaManagerApi.useGetSiteBinsQuery(instanceId);
  const { data: files } = mediaManagerApi.useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

  console.log("ALL MEDIA FILES", files);

  return <div>All Media</div>;
};
