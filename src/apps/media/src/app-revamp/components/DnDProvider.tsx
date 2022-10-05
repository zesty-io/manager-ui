import { FC } from "react";
import { useDropzone } from "react-dropzone";
import { useCallback } from "react";
import { uploadFile } from "../../../../../shell/store/media-revamp";
import { useDispatch } from "react-redux";
import Box from "@mui/material/Box";

export const DnDProvider: FC = ({ children }) => {
  const dispatch = useDispatch();
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log({ acceptedFiles });
    acceptedFiles.forEach((f) => dispatch(uploadFile(f)));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  return (
    <Box
      sx={{ display: "flex" }}
      {...getRootProps({ onClick: (e) => e.stopPropagation() })}
    >
      <input {...getInputProps()} />
      {isDragActive ? "DROP FILES HERE" : children}
    </Box>
  );
};
