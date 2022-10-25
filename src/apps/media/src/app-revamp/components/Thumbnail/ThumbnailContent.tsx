import { FC } from "react";
import {
  TextField,
  Typography,
  CardContent,
  Box,
  Tooltip,
} from "@mui/material";

interface Props {
  extension: string;
  backgroundColor: string;
  color: string;
  filename: string;
  onFilenameChange?: (value: string) => void;
  onTitleChange?: (value: string) => void;
  isEditable?: boolean;
}

export const ThumbnailContent: FC<Props> = ({
  extension,
  filename,
  backgroundColor,
  color,
  onFilenameChange,
  onTitleChange,
  isEditable,
}) => {
  const styledCardContent = {
    px: onFilenameChange ? 0 : 1,
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
        {/* @ts-expect-error body 3 not type */}
        <Typography variant="body3">{extension}</Typography>
      </Box>
      <CardContent sx={styledCardContent}>
        {onFilenameChange ? (
          <Box>
            <Box>
              <TextField
                value={filename}
                size="small"
                variant="outlined"
                fullWidth
                disabled={!isEditable}
                onChange={(e) => onFilenameChange(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 0,
                    "&.Mui-focused": {
                      fieldset: {
                        borderRight: "0 !important",
                        borderLeft: "0 !important",
                      },
                    },
                    fieldset: {
                      borderRight: 0,
                      borderLeft: 0,
                    },
                  },
                }}
              />
            </Box>
            <Box>
              <TextField
                placeholder={
                  isEditable
                    ? "Add image title (for alt text)"
                    : "Please wait to add image title"
                }
                disabled={!isEditable}
                size="small"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                onChange={(e) => onTitleChange(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 0,
                    fieldset: {
                      borderWidth: "0 !important",
                    },
                  },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Tooltip title={filename}>
            <Typography variant="caption">{filename}</Typography>
          </Tooltip>
        )}
      </CardContent>
    </>
  );
};
