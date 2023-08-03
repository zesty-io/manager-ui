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
  setCurrentFilesCallback: (files: File[]) => void;
}

export const Media = ({
  addImagesCallback,
  setCurrentFilesCallback,
}: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  if (id.startsWith("1")) {
    return (
      <BinMedia
        addImagesCallback={addImagesCallback}
        setCurrentFilesCallback={setCurrentFilesCallback}
      />
    );
  } else if (id.startsWith("2")) {
    return (
      <FolderMedia
        addImagesCallback={addImagesCallback}
        setCurrentFilesCallback={setCurrentFilesCallback}
      />
    );
  } else {
    return <NotFoundState />;
  }
};
