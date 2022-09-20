import { useParams } from "react-router";
import { FolderMedia } from "./FolderMedia";
import { BinMedia } from "./BinMedia";

type Params = { id: string };

export const Media = () => {
  const params = useParams<Params>();
  const { id } = params;
  if (id.startsWith("1")) {
    return <BinMedia />;
  } else if (id.startsWith("2")) {
    return <FolderMedia />;
  } else {
    return <div>INVALID ID</div>;
  }
};
