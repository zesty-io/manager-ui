import { FC } from "react";
import { TextField, Typography, CardContent } from "@mui/material";

interface Props {
  filename: string;
  onFilenameChange?: (value: string) => void;
  isEditable?: boolean;
}

export const ThumbnailContent: FC<Props> = ({
  filename,
  onFilenameChange,
  isEditable,
}) => {
  const styledCardContent = {
    px: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  return (
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
  );
};
