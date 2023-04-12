import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Box,
  Button,
  Tooltip,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useFilePath } from "../../../../../../../../../../shell/hooks/useFilePath";
import { Link } from "react-router-dom";

import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import { Database } from "@zesty-io/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

export const ContentInfo = (props) => {
  const [isCopied, setIsCopied] = useState(null);

  const codePath = useFilePath(props.modelZUID);

  const handleCopyClick = (data) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(data);
        setTimeout(() => {
          setIsCopied(null);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Card elevation={0} sx={{ mx: 2, mb: 3 }}>
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "#10182866",
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "#101828",
          },
        }}
        title="INFO"
      ></CardHeader>
      <CardContent
        sx={{
          p: 0,
          pt: 2,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        <Stack gap={1.5}>
          <Box>
            <Stack direction="row" alignItems="center" gap={1} pb={0.5}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                }}
              >
                ZUID
              </Typography>
              <Tooltip
                title="Content items are always accessed relative to their model, so a model ZUID is required for each call."
                sx={{
                  fontSize: "12px",
                  color: "#10182866",
                }}
              >
                <InfoRoundedIcon size="inherit" color="inherit" />
              </Tooltip>
            </Stack>
            <TextField
              disabled
              value={props.modelZUID}
              fullWidth
              inputProps={{
                sx: {
                  ":read-only": {
                    textFillColor: "#101828",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyClick(props.modelZUID)}
                    >
                      {isCopied === props.modelZUID ? (
                        <CheckIcon color="action" />
                      ) : (
                        <ContentCopyRoundedIcon color="action" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Stack width="fit-content" sx={{ color: "#475467" }}>
            <Button
              component={Link}
              to={`/schema/${props.modelZUID}`}
              color="inherit"
              startIcon={<Database sx={{ color: "#10182866" }} />}
            >
              Edit Model
            </Button>
            <Button
              component={Link}
              to={codePath}
              color="inherit"
              startIcon={<CodeRoundedIcon sx={{ fill: "#10182866" }} />}
            >
              Edit Code
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
