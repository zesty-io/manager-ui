import { FC, useRef } from "react";
import Button from "@mui/material/Button";
import FileUpload from "@mui/icons-material/FileUpload";
import { Typography } from "@mui/material";
import { uploadFile } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import { ChangeEventHandler } from "react";

export type UploadButton = {};
export const UploadButton: FC<UploadButton> = ({}) => {
  const dispatch = useDispatch();
  const hiddenFileInput = useRef(null);
  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    Array.from(event.target.files).forEach((file) => {
      dispatch(uploadFile(file));
    });
  };
  const handleUploadButtonClick = () => {
    hiddenFileInput.current.click();
  };
  return (
    <>
      <Button
        onClick={handleUploadButtonClick}
        variant="contained"
        color="primary"
      >
        <FileUpload />
        <Typography color="white">Upload</Typography>
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
