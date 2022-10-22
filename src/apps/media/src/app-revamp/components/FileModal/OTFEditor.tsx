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
  Button,
  Typography,
  Slider,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import { FlipHorizontal, FlipVertical } from "@zesty-io/material";
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

  const handleRotate = () => {
    if (!imageSettings.orient) {
      // TODO: Refactor and find patterns
      setImageSettings({
        ...imageSettings,
        orient: "r",
      });
    } else if (imageSettings.orient === "r") {
      setImageSettings({
        ...imageSettings,
        orient: "vh",
      });
    } else if (imageSettings.orient === "vh") {
      setImageSettings({
        ...imageSettings,
        orient: "l",
      });
    } else if (imageSettings.orient === "l") {
      setImageSettings({
        ...imageSettings,
        orient: "",
      });
    } else if (imageSettings.orient === "h") {
      setImageSettings({
        ...imageSettings,
        orient: "lv",
      });
    } else if (imageSettings.orient === "lv") {
      setImageSettings({
        ...imageSettings,
        orient: "v",
      });
    } else if (imageSettings.orient === "v") {
      setImageSettings({
        ...imageSettings,
        orient: "rv",
      });
    } else if (imageSettings.orient === "rv") {
      setImageSettings({
        ...imageSettings,
        orient: "h",
      });
    }
  };

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
          <Stack direction="row" alignItems="center" gap={1}>
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
          <Box sx={{ maxWidth: "186px" }}>
            <InputLabel>Blur</InputLabel>
            <TextField
              fullWidth
              placeholder="0"
              value={imageSettings?.blur || ""}
              onChange={(evt) => {
                if (evt.target.value === "0") return;
                setImageSettings({ ...imageSettings, blur: evt.target.value });
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BlurOnRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Stack direction="row" gap={2} alignItems="flex-end">
            <Button
              sx={{ minWidth: "40px", width: "40px", height: "40px" }}
              color="inherit"
              variant="outlined"
              onClick={handleRotate}
            >
              <RotateRightRoundedIcon color="action" />
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              sx={{ minWidth: "40px", width: "40px", height: "40px" }}
              onClick={() => {
                // TODO: Refactor and find patterns
                if (!imageSettings.orient) {
                  setImageSettings({
                    ...imageSettings,
                    orient: "h",
                  });
                } else if (imageSettings.orient === "h") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "",
                  });
                } else if (imageSettings.orient === "vh") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "v",
                  });
                } else if (imageSettings.orient === "v") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "vh",
                  });
                } else if (imageSettings.orient === "r") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "rv",
                  });
                } else if (imageSettings.orient === "l") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "lv",
                  });
                } else if (imageSettings.orient === "rv") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "r",
                  });
                } else if (imageSettings.orient === "lv") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "l",
                  });
                }
              }}
            >
              <FlipHorizontal color="action" />
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              sx={{ minWidth: "40px", width: "40px", height: "40px" }}
              onClick={() => {
                // TODO: Refactor and find patterns
                if (!imageSettings.orient) {
                  setImageSettings({
                    ...imageSettings,
                    orient: "v",
                  });
                } else if (imageSettings.orient === "v") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "",
                  });
                } else if (imageSettings.orient === "vh") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "h",
                  });
                } else if (imageSettings.orient === "h") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "vh",
                  });
                } else if (imageSettings.orient === "r") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "lv",
                  });
                } else if (imageSettings.orient === "l") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "rv",
                  });
                } else if (imageSettings.orient === "rv") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "l",
                  });
                } else if (imageSettings.orient === "lv") {
                  setImageSettings({
                    ...imageSettings,
                    orient: "r",
                  });
                }
              }}
            >
              <FlipVertical color="action" />
            </Button>
          </Stack>
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
            disappear
          </Box>{" "}
          after you go back.
        </Alert>
      </Box>
    </Box>
  );
};
