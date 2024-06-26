import { FC } from "react";
import {
  TextField,
  Typography,
  CardContent,
  Box,
  Tooltip,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import { withCursorPosition } from "../../../../../../shell/components/withCursorPosition";

const TextFieldWithCursorPosition = withCursorPosition(TextField);

interface Props {
  filename: string;
  onFilenameChange?: (value: string) => void;
  onTitleChange?: (value: string) => void;
  isSelected?: boolean;
  isFilenameEditable?: boolean;
  isTitleEditable?: boolean;
  title?: string;
}

export const ThumbnailContent: FC<Props> = ({
  filename,
  onFilenameChange,
  onTitleChange,
  isSelected,
  isFilenameEditable,
  isTitleEditable,
  title,
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
              <TextFieldWithCursorPosition
                value={filename}
                size="small"
                variant="outlined"
                fullWidth
                disabled={!isFilenameEditable}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onFilenameChange(e.target.value.replace(" ", "-"))
                }
                sx={{
                  "& .MuiInputBase-root.MuiOutlinedInput-root": {
                    borderRadius: 0,
                  },
                }}
                InputProps={{
                  sx: {
                    height: "42px",
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
                  isTitleEditable
                    ? "Add File Title (for alt-text)"
                    : "Please wait to add File Title"
                }
                disabled={!isTitleEditable}
                defaultValue={title}
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
