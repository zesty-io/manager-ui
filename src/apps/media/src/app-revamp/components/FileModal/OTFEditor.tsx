import { useEffect, useState } from "react";
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
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import BlurOnRoundedIcon from "@mui/icons-material/BlurOnRounded";
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

  useEffect(() => setImageSettings({ ...imageSettings, fit: "cover" }), []);

  return (
    <Box>
      <Box
        sx={{
          p: 2,
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
      <Stack gap={2} sx={{ p: 2 }}>
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
        <Stack direction="row" gap={2}>
          <Box width="100%">
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
          <Box width="100%">
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
        <Stack direction="row" gap={2}>
          {/* <Box>
            <InputLabel>Rotate</InputLabel>
            <Button><RotateRightRoundedIcon /></Button>
            <TextField
              fullWidth
              placeholder="Auto"
              value={imageSettings?.width || ""}
              onChange={(evt) =>
                setImageSettings({ ...imageSettings, width: evt.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    
                  </InputAdornment>
                ),
              }}
            />
          </Box> */}
          <Box sx={{ width: 186 }}>
            <InputLabel>Blur</InputLabel>
            <TextField
              fullWidth
              placeholder="0"
              value={imageSettings?.blur || ""}
              onChange={(evt) =>
                setImageSettings({ ...imageSettings, blur: evt.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BlurOnRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Stack>
        <Box>
          <InputLabel>Saturation</InputLabel>
          <Slider
            aria-label="Saturation"
            valueLabelDisplay="auto"
            value={Number(imageSettings?.saturation) || 0}
            min={-100}
            max={100}
            onChange={(_, val) =>
              setImageSettings({ ...imageSettings, saturation: String(val) })
            }
            size="small"
          />
        </Box>
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
      </Stack>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          p: 2,
          backgroundColor: "grey.50",
          borderTop: (theme) => `1px solid ${theme.palette.border}`,
        }}
      >
        <InputLabel>✨New Url</InputLabel>
        <TextField
          fullWidth
          placeholder="Auto"
          value={newUrl}
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            sx: { background: "white" },
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
        <Alert severity="info" sx={{ mt: 2 }}>
          This New URL is{" "}
          <Box component="strong" sx={{ color: "text.primary" }}>
            temporary
          </Box>{" "}
          and will{" "}
          <Box component="strong" sx={{ color: "text.primary" }}>
            temporary
          </Box>{" "}
          after you go back.
        </Alert>
      </Box>
    </Box>
  );
};
