import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useState } from "react";

type ImageCellProps = { params: GridRenderCellParams };
export const ImageCell = ({ params }: ImageCellProps) => {
  const [hasError, setHasError] = useState(false);
  const handleImageError = () => {
    setHasError(true);
  };

  if (!params.value || hasError) {
    return (
      <Stack
        sx={{
          backgroundColor: "grey.100",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: -1,
        }}
      >
        <ImageRounded fontSize="small" color="action" />
      </Stack>
    );
  }

  return (
    <Box
      component="img"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[100],
        objectFit: "contain",
        zIndex: -1,
      }}
      width="68px"
      height="58px"
      src={params.value}
      onError={handleImageError}
    />
  );
};
