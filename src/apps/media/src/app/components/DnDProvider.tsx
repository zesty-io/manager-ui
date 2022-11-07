import { FC, ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import {
  uploadFile,
  fileUploadStage,
} from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import { Bin, Group } from "../../../../../shell/services/types";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";
import { SxProps } from "@mui/system";
import { DropArea } from "./DropArea";

interface Props {
  children: React.ReactNode;
  currentBinId: string;
  currentGroupId: string;
  isDefaultBin?: boolean;
  sx?: SxProps;
}

export const DnDProvider = ({
  children,
  currentGroupId,
  currentBinId,
  isDefaultBin,
  sx,
}: Props) => {
  const dispatch = useDispatch();
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId, { skip: !currentGroupId });
  const { data: binData, isFetching: binIsFetching } = useGetBinQuery(
    currentBinId,
    { skip: !currentBinId }
  );
  const loading = binIsFetching || groupIsFetching;

  const currentBin = binData?.[0];
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (loading || !currentBin?.id) return;

      dispatch(
        fileUploadStage(
          acceptedFiles.map((file) => {
            return {
              file,
              bin_id: currentBin.id,
              group_id: currentGroup?.id || currentBin.id,
            };
          })
        )
      );
    },
    [currentBin, currentGroup, loading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box
      data-testid="dnd-provider-box"
      sx={{
        display: "flex",
        flex: 1,
        ...sx,
      }}
      {...getRootProps({ onClick: (evt) => evt.stopPropagation() })}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <>
          <DropArea
            isDefaultBin={isDefaultBin}
            currentGroup={currentGroup}
            currentBin={currentBin}
          />
          {children}
        </>
      ) : (
        children
      )}
    </Box>
  );
};
