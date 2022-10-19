import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import { Thumbnail } from "./Thumbnail";
import { FC } from "react";
import { Box } from "@mui/material";

import { mediaManagerApi } from "../../../../../shell/services/mediaManager";
import {
  uploadFile,
  UploadFile,
  Upload,
  fileUploadSetFilename,
  deleteUpload,
} from "../../../../../shell/store/media-revamp";

interface Props {
  file: Upload;
}

export const UploadThumbnail: FC<Props> = ({ file }) => {
  const dispatch = useDispatch();

  const { data: bin } = mediaManagerApi.useGetBinQuery(file.bin_id, {
    skip: !file.bin_id,
  });

  useEffect(() => {
    if (bin && file.status === "staged") {
      dispatch(uploadFile(file, bin[0]));
    }
  }, [bin]);

  const onRemove =
    file.status !== "success"
      ? undefined
      : async () => {
          dispatch(deleteUpload(file));
        };

  const getProgress = () => {
    if (file.status === "success") return 100;
    if (file.status === "inProgress") return file.progress;
    return 0;
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,.5)",
          width: `${100 - getProgress()}%`,
          height: "100%",
          position: "absolute",
          right: "0",
          // TODO what should this be? Doesn't show up without z-index
          zIndex: 100,
          //transform: `translateX(${file.progress || 0}%)`,
        }}
      ></Box>
      <Thumbnail
        src={file.url}
        filename={file.filename}
        isEditable={file.status === "success"}
        onRemove={onRemove}
        onFilenameChange={(filename) => {
          if (file.status === "success") {
            dispatch(fileUploadSetFilename({ upload: file, filename }));
          }
        }}
      />
    </>
  );
};
