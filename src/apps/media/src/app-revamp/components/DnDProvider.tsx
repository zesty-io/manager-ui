import { FC, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { uploadFile } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { Bin, Group } from "../../../../../shell/services/types";
import { mediaManagerApi } from "../../../../../shell/services/mediaManager";

export type DnDProvider = {
  children: ReactNode;
  currentBin: Bin;
  currentGroup: Group;
};

export const DnDProvider: FC<DnDProvider> = ({ children, currentGroup }) => {
  const dispatch = useDispatch();
  const { data: binData, isFetching } = mediaManagerApi.useGetBinQuery(
    currentGroup?.bin_id
  );
  console.log({ binData });
  const currentBin = binData?.[0];
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log({ acceptedFiles });
      acceptedFiles.forEach((file) => {
        const fileToUpload = {
          file,
          bin_id: currentBin.id,
          group_id: currentGroup.group_id,
        };
        dispatch(uploadFile(fileToUpload, currentBin));
      });
    },
    [currentBin, currentGroup]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box sx={{ display: "flex" }} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? "DROP FILES HERE" : children}
    </Box>
  );
};
