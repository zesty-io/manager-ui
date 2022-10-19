import { FC } from "react";
import { TextField, Typography, CardContent, Box } from "@mui/material";

interface Props {
  extension: string;
  backgroundColor: string;
  color: string;
  filename: string;
  onFilenameChange?: (value: string) => void;
  isEditable?: boolean;
}

export const ThumbnailContent: FC<Props> = ({
  extension,
  filename,
  backgroundColor,
  color,
  onFilenameChange,
  isEditable,
}) => {
  const styledCardContent = {
    px: 1,
    py: 1.5,
    paddingBottom: "12px !important",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const styledBadge = {
    px: 1,
    py: 0.4,
    borderRadius: "4px",
    textTransform: "uppercase",
    position: "absolute",
    right: 15,
    transform: "translateY(-120%)",
  };

  return (
    <>
      <Box
        sx={{
          ...styledBadge,
          backgroundColor,
          color,
        }}
      >
        {extension}
      </Box>
      <CardContent sx={styledCardContent}>
        {isEditable ? (
          <TextField
            value={filename}
            size="small"
            variant="outlined"
            color="primary"
            InputProps={{ sx: { flex: 1 } }}
            fullWidth
            onChange={(e) => onFilenameChange(e.target.value)}
          />
        ) : (
          <Typography variant="caption">{filename}</Typography>
        )}
      </CardContent>
    </>
  );
};
