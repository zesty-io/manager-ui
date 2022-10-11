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

  //const params = useParams<any>();
  //const { data: group } = mediaManagerApi.useGetGroupDataQuery(params.id);
  const { data: bin } = mediaManagerApi.useGetBinQuery(file.bin_id, {
    skip: !file.bin_id,
  });
  console.log(file);

  useEffect(() => {
    if (bin) {
      dispatch(uploadFile(file, bin[0]));
    }
  }, [bin]);

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
      <Thumbnail src={file.url} filename={file.filename} isEditable={true} />
    </>
  );
};
