import { FC, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { uploadFile } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { Bin, Group } from "../../../../../shell/services/types";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";

export type DnDProvider = {
  children: ReactNode;
  currentBinId: string;
  currentGroupId: string;
};

export const DnDProvider: FC<DnDProvider> = ({
  children,
  currentGroupId,
  currentBinId,
}) => {
  const dispatch = useDispatch();
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId);
  const { data: binData, isFetching: binIsFetching } =
    useGetBinQuery(currentBinId);
  const loading = binIsFetching || groupIsFetching;
  /*
  const { data: binData, isFetching } = mediaManagerApi.useGetBinQuery(
    currentGroup?.bin_id
  );
  */
  console.log({ binData, currentGroup });
  const currentBin = binData?.[0];
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (loading) return;
      console.log({ acceptedFiles });
      acceptedFiles.forEach((file) => {
        const fileToUpload = {
          file,
          bin_id: currentBin.id,
          group_id: currentGroup.id,
        };
        dispatch(uploadFile(fileToUpload, currentBin));
      });
    },
    [currentBin, currentGroup, loading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box
      sx={{ height: "100%" }}
      {...getRootProps({ onClick: (e) => e.stopPropagation() })}
    >
      <input {...getInputProps()} />
      {isDragActive ? "DROP FILES HERE" : children}
    </Box>
  );
};
