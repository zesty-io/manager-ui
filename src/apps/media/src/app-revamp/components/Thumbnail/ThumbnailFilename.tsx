import { FC } from "react";
import { TextField, Typography, CardContent } from "@mui/material";

interface Props {
  filename: string;
  onFilenameChange?: (value: string) => void;
  isEditable?: boolean;
}

export const ThumbnailFilename: FC<Props> = ({
  filename,
  onFilenameChange,
  isEditable,
}) => {
  return (
    <CardContent
      sx={{
        px: 1,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
      }}
    >
      {isEditable ? (
        <TextField
          value={filename}
          size="small"
          variant="outlined"
          color="primary"
          InputProps={{ sx: { flex: 1 } }}
          fullWidth
          onChange={(evt) => onFilenameChange(evt.target.value)}
        />
      ) : (
        <Typography variant="caption">{filename}</Typography>
      )}
    </CardContent>
  );
};
