import { FC, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { uploadFile } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { Bin, Group } from "../../../../../shell/services/types";

export type DnDProvider = {
  children: ReactNode;
  currentBin: Bin;
  currentGroup: Group;
};

export const DnDProvider: FC<DnDProvider> = ({
  children,
  currentBin,
  currentGroup,
}) => {
  const dispatch = useDispatch();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log({ acceptedFiles });
    acceptedFiles.forEach((file) => {
      const fileToUpload = {
        file,
        bin_id: currentBin.id,
        group_id: currentGroup.group_id,
      };
      dispatch(uploadFile(fileToUpload, currentBin));
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box sx={{ display: "flex" }} {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? "DROP FILES HERE" : children}
    </Box>
  );
};
