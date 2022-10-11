import { FC, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import {
  uploadFile,
  fileUploadObjects,
} from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { Bin, Group } from "../../../../../shell/services/types";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";
import { SxProps } from "@mui/system";

interface Props {
  children: React.ReactNode;
  currentBinId: string;
  currentGroupId: string;
  sx?: SxProps;
}

export const DnDProvider = ({
  children,
  currentGroupId,
  currentBinId,
  sx,
}: Props) => {
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
  // console.log({ binData, currentGroup });
  const currentBin = binData?.[0];
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("onDrop");
      if (loading) return;
      // console.log({ acceptedFiles });

      dispatch(
        fileUploadObjects(
          acceptedFiles.map((file) => {
            return {
              file,
              bin_id: currentBin.id,
              group_id: currentGroup.id,
            };
          })
        )
      );

      // acceptedFiles.forEach((file) => {
      //   const fileToUpload = {
      //     file,
      //     bin_id: currentBin.id,
      //     group_id: currentGroup.id,
      //   };
      //   dispatch(uploadFile(fileToUpload, currentBin));
      // });
    },
    [currentBin, currentGroup, loading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        ...sx,
      }}
      {...getRootProps({ onClick: (evt) => evt.stopPropagation() })}
    >
      <input {...getInputProps()} />
      {isDragActive ? "DROP FILES HERE" : children}
    </Box>
  );
};
