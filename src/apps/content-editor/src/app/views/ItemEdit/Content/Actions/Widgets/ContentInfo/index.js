import { alpha } from "@mui/material/styles";
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
  Skeleton,
} from "@mui/material";
import { useFilePath } from "../../../../../../../../../../shell/hooks/useFilePath";
import { Link } from "react-router-dom";

import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckIcon from "@mui/icons-material/Check";
import { Database, theme } from "@zesty-io/material";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { useTranslation } from "react-i18next";

export const ContentInfo = (props) => {
  const { t } = useTranslation();
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
    <Card elevation={0} sx={{ mb: 3, backgroundColor: "transparent" }}>
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: alpha(theme.palette.text.primary, 0.4),
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "text.primary",
            textTransform: "uppercase",
          },
        }}
        title={t("content.itemEditInfoTitle")}
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
        {props.isLoadingItem ? (
          <Stack gap={1.5}>
            <Box>
              <Stack direction="row" justifyContent="space-between" pb={0.5}>
                <Skeleton variant="rounded" width={192} height={20} />
                <Skeleton variant="circular" width={20} height={20} />
              </Stack>
              <Skeleton variant="rounded" width="100%" height={40} />
            </Box>
            <Skeleton variant="rounded" width={109} height={32} />
            <Skeleton variant="rounded" width={109} height={32} />
          </Stack>
        ) : (
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
                  title={t("content.itemEditZuidTooltip")}
                  sx={{
                    fontSize: "12px",
                    color: alpha(theme.palette.text.primary, 0.4),
                  }}
                >
                  <InfoRoundedIcon size="inherit" color="inherit" />
                </Tooltip>
              </Stack>
              <TextField
                disabled
                value={props.itemZUID || ""}
                size="small"
                fullWidth
                inputProps={{
                  sx: {
                    ":read-only": {
                      textFillColor: theme.palette.text.primary,
                    },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => handleCopyClick(props.itemZUID || "")}
                      >
                        {isCopied === props.itemZUID ? (
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
            <Stack width="fit-content" sx={{ color: "text.secondary" }}>
              <Button
                component={Link}
                to={`/schema/${props.modelZUID}`}
                color="inherit"
                startIcon={
                  <Database
                    sx={{ color: alpha(theme.palette.text.primary, 0.4) }}
                  />
                }
                sx={{ width: "fit-content" }}
              >
                {t("content.itemListEditModel")}
              </Button>
              <Button
                component={Link}
                to={codePath}
                color="inherit"
                startIcon={
                  <CodeRoundedIcon
                    sx={{ fill: alpha(theme.palette.text.primary, 0.4) }}
                  />
                }
                sx={{ width: "fit-content" }}
              >
                {t("content.itemEditEditCode")}
              </Button>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
