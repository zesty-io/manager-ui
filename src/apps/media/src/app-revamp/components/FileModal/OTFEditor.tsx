import { useState } from "react";
import {
  Box,
  InputLabel,
  Stack,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  Button,
  Typography,
  Slider,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { isEmpty, omitBy } from "lodash";

interface Props {
  url: string;
  setShowEdit: (show: boolean) => void;
  imageSettings: any;
  setImageSettings: (settings: any) => void;
}

export const OTFEditor = ({
  url,
  setShowEdit,
  imageSettings,
  setImageSettings,
}: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const newUrl = `${url}?${new URLSearchParams(
    omitBy(imageSettings, isEmpty)
  ).toString()}`;

  const handleCopyClick = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleDone = () => {
    setShowEdit(false);
    setImageSettings(null);
  };

  return (
    <Box>
      <Box
        sx={{
          p: 3,
          borderBottom: (theme) => `1px solid ${theme.palette.border}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center">
            <IconButton
              size="small"
              sx={{ height: "fit-content" }}
              onClick={handleDone}
            >
              <ArrowBackRoundedIcon fontSize="small" color="action" />
            </IconButton>
            <Typography variant="body1">On The Fly Image Editor</Typography>
          </Stack>
          <Button size="small" variant="contained" onClick={handleDone}>
            Done
          </Button>
        </Stack>
      </Box>
      <Stack gap={3} sx={{ p: 3 }}>
        <Stack direction="row" gap={3}>
          <Box>
            <InputLabel>Width</InputLabel>
            <TextField
              fullWidth
              placeholder="Auto"
              value={imageSettings?.width || ""}
              onChange={(evt) =>
                setImageSettings({ ...imageSettings, width: evt.target.value })
              }
            />
          </Box>
          <Box>
            <InputLabel>Height</InputLabel>
            <TextField
              fullWidth
              placeholder="Auto"
              value={imageSettings?.height || ""}
              onChange={(evt) =>
                setImageSettings({ ...imageSettings, height: evt.target.value })
              }
            />
          </Box>
        </Stack>
        {/* <Box>
          <InputLabel>Saturation</InputLabel>
          <Slider
            aria-label="Saturation"
            valueLabelDisplay="auto"
            defaultValue={0}
          />
        </Box>
        <Box>
          <InputLabel>Blur</InputLabel>
          <Slider
            aria-label="Saturation"
            valueLabelDisplay="auto"
            defaultValue={0}
          />
        </Box> */}
        <Box>
          <InputLabel>Optimize</InputLabel>
          <Select
            fullWidth
            value={imageSettings?.optimize || ""}
            onChange={(evt) =>
              setImageSettings({
                ...imageSettings,
                optimize: evt.target.value,
              })
            }
            displayEmpty
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </Box>
        <Box>
          <InputLabel>Fit</InputLabel>
          <Select
            fullWidth
            value={imageSettings?.fit || ""}
            onChange={(evt) =>
              setImageSettings({ ...imageSettings, fit: evt.target.value })
            }
            displayEmpty
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="bounds">Bounds</MenuItem>
            <MenuItem value="cover">Cover</MenuItem>
            <MenuItem value="crop">Crop</MenuItem>
          </Select>
        </Box>
        <Box>
          <InputLabel>New Url</InputLabel>
          <TextField
            fullWidth
            placeholder="Auto"
            value={newUrl}
            InputProps={{
              readOnly: true,
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  {isCopied ? (
                    <CheckIcon />
                  ) : (
                    <IconButton onClick={() => handleCopyClick(newUrl)}>
                      <ContentCopyIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Alert severity="info">
          <AlertTitle>Please note:</AlertTitle>
          <ul>
            <li>
              These changes will not reflect in the image preview on the left or
              the thumbnails.
            </li>
            <li>
              This New URL is{" "}
              <Box component="strong" sx={{ color: "text.primary" }}>
                temporary
              </Box>{" "}
              and will disappear after you go back.
            </li>
          </ul>
        </Alert>
      </Stack>
    </Box>
  );
};
