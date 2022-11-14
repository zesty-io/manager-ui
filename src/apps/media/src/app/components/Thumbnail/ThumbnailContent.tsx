import { FC } from "react";
import {
  TextField,
  Typography,
  CardContent,
  Box,
  Tooltip,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

interface Props {
  filename: string;
  onFilenameChange?: (value: string) => void;
  onTitleChange?: (value: string) => void;
  isEditable?: boolean;
  isSelected?: boolean;
}

export const ThumbnailContent: FC<Props> = ({
  filename,
  onFilenameChange,
  onTitleChange,
  isEditable,
  isSelected,
}) => {
  const styledCardContent = {
    px: onFilenameChange ? 0 : 1,
    py: onFilenameChange ? 0 : 1.5,
    paddingBottom: "12px !important",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    backgroundColor: (theme: any) =>
      isSelected &&
      `${alpha(
        theme.palette.primary.main,
        theme.palette.action.hoverOpacity
      )} !important`,
  };

  return (
    <>
      <CardContent sx={styledCardContent} data-testid="media-thumbnail-content">
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
                    height: "42px",
                    color: "text.secondary",
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
                    ? "Add File Title (for alt-text)"
                    : "Please wait to add File Title"
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
                    color: "text.secondary",
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
