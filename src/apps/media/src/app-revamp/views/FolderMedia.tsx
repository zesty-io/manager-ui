import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";

type Params = { binId: string };

export const FolderMedia = () => {
  const params = useParams<Params>();
  // TODO assumes that it is a bin (i.e. not group)
  const { binId } = params;
  // TODO potentially provide user feedback for an invalid binID
  const { data: files } = mediaManagerApi.useGetBinFilesQuery(binId);

  console.log(`FILES FOR BIN ${binId}`, files);

  if (files && files.length === 0) return <EmptyState />;

  return <div> Bin View </div>;
};
