import { Thumbnail } from "./Thumbnail";
import { FC } from "react";
import { Box } from "@mui/material";

interface Props {
  progress: number;
  src: string;
  filename: string;
  isEditable?: boolean;
}

export const UploadThumbnail: FC<Props> = ({
  progress,
  src,
  filename,
  isEditable,
}) => {
  return (
    <>
      <Box
        sx={{
          backgroundColor: "rgba(255,255,255,.5)",
          width: "100%",
          height: "100%",
          position: "absolute",
          left: "0",
          transform: `translateX(${progress}%)`,
        }}
      ></Box>
      <Thumbnail src={src} filename={filename} isEditable={isEditable} />
    </>
  );
};
