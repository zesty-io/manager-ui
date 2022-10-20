import { FC, useRef } from "react";
import Button from "@mui/material/Button";
import FileUpload from "@mui/icons-material/FileUpload";
import { Typography } from "@mui/material";
import { fileUploadStage } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import { ChangeEventHandler } from "react";
import { Bin, Group } from "../../../../../shell/services/types";
import {
  useGetBinQuery,
  useGetGroupDataQuery,
} from "../../../../../shell/services/mediaManager";

export type UploadButton = {
  currentGroupId?: string;
  currentBinId: string;
  text?: string;
  variant?: "text" | "outlined" | "contained";
};

export const UploadButton: FC<UploadButton> = ({
  currentBinId,
  currentGroupId,
  text,
  variant = "contained",
}) => {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId, { skip: !currentGroupId });
  const { data: binData, isFetching: binIsFetching } = useGetBinQuery(
    currentBinId,
    { skip: !currentBinId }
  );
  const loading = binIsFetching || groupIsFetching;
  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (loading) return;
    const currentBin = binData[0];

    dispatch(
      fileUploadStage(
        Array.from(event.target.files).map((file) => {
          return {
            file,
            bin_id: currentBin.id,
            group_id: currentGroup?.id || currentBin.id,
          };
        })
      )
    );
  };
  const handleUploadButtonClick = () => {
    //clears any previous file input value to allow for the same file to be uploaded again
    hiddenFileInput.current.value = "";
    hiddenFileInput.current.click();
  };
  return (
    <>
      <Button
        onClick={handleUploadButtonClick}
        variant={variant}
        color="primary"
        startIcon={<FileUpload />}
      >
        {text || "Upload"}
      </Button>
      <input
        type="file"
        multiple
        ref={hiddenFileInput}
        onChange={handleFileInputChange}
        hidden
        style={{ display: "none" }}
      />
    </>
  );
};
