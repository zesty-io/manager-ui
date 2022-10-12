import { FC, useRef } from "react";
import Button from "@mui/material/Button";
import FileUpload from "@mui/icons-material/FileUpload";
import { Typography } from "@mui/material";
import { fileUploadInitiate } from "../../../../../shell/store/media-revamp";
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
};

export const UploadButton: FC<UploadButton> = ({
  currentBinId,
  currentGroupId,
  text,
}) => {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);
  const { data: currentGroup, isFetching: groupIsFetching } =
    useGetGroupDataQuery(currentGroupId);
  const { data: binData, isFetching: binIsFetching } =
    useGetBinQuery(currentBinId);
  const loading = binIsFetching || groupIsFetching;
  console.log({ binData, currentGroup });
  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (loading) return;
    const currentBin = binData[0];

    dispatch(
      fileUploadInitiate(
        Array.from(event.target.files).map((file) => {
          return {
            file,
            bin_id: currentBin.id,
            group_id: currentGroup.id,
          };
        })
      )
    );
  };
  const handleUploadButtonClick = () => {
    console.log("click");
    hiddenFileInput.current.click();
  };
  return (
    <>
      <Button
        onClick={handleUploadButtonClick}
        variant="contained"
        color="primary"
        startIcon={<FileUpload />}
      >
        <Typography color="white">{text || "Upload"}</Typography>
        Upload
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
