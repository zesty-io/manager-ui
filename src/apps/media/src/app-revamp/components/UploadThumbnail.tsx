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
} from "../../../../../shell/store/media-revamp";

interface Props {
  file: UploadFile;
}

export const UploadThumbnail: FC<Props> = ({ file }) => {
  const dispatch = useDispatch();

  const { data: bin } = mediaManagerApi.useGetBinQuery(file.bin_id, {
    skip: !file.bin_id,
  });

  const [deleteFile] = mediaManagerApi.useDeleteFileMutation();

  //const delete
  console.log(file);

  useEffect(() => {
    if (bin) {
      dispatch(uploadFile(file, bin[0]));
    }
  }, [bin]);

  const onRemove =
    file.progress !== 100
      ? undefined
      : async () => {
          const promise = deleteFile({
            id: file.uploadID,
            body: { group_id: file.group_id },
          });
          console.log({ promise });
          const res = await promise;
          console.log({ res });
        };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,.5)",
          width: `${100 - file.progress}%`,
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
        isEditable={true}
        onRemove={onRemove}
      />
    </>
  );
};
