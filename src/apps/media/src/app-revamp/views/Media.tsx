import { useParams } from "react-router";
import { FolderMedia } from "./FolderMedia";
import { BinMedia } from "./BinMedia";
import { File } from "../../../../../shell/services/types";
import { NotFoundState } from "../components/NotFoundState";

type Params = {
  id: string;
};

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const Media = ({ addImagesCallback }: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  if (id.startsWith("1")) {
    return <BinMedia addImagesCallback={addImagesCallback} />;
  } else if (id.startsWith("2")) {
    return <FolderMedia addImagesCallback={addImagesCallback} />;
  } else {
    return <NotFoundState />;
  }
};
