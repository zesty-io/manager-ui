import { FC } from "react";
import Button from "@mui/material/Button";
import FileUpload from "@mui/icons-material/FileUpload";
import { Typography } from "@mui/material";
import Pic from "../downloading.svg";

export type UploadButton = {
  onClick: () => void;
};
export const UploadButton: FC<UploadButton> = ({ onClick }) => {
  return (
    <>
      <Button onClick={onClick} variant="contained" color="primary">
        <FileUpload />
        <Typography color="white">Upload</Typography>
      </Button>
    </>
  );
};
