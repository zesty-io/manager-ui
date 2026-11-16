import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";

import { activate } from "shell/store/releases";

export function Activate({ isContentSubpage }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const handleActivate = () => {
    setLoading(true);
    dispatch(activate())
      .then((res) => {
        if (res.status === 204) {
          history.push(
            isContentSubpage ? `/content/releases/create` : `/release/create`
          );
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Box
      sx={{
        typography: "body2",
        lineHeight: "24px",
        letterSpacing: 0,
        height: "calc(100vh - 225px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 200, lineHeight: "42px", letterSpacing: "0.32px" }}
        >
          {t("release.releasesHeading")}
        </Typography>
        <Typography
          variant="h4"
          component="p"
          sx={{ fontWeight: 400, lineHeight: "36px", letterSpacing: "0.16px" }}
        >
          {t("release.activateSubtitle")}
        </Typography>

        <Button
          variant="contained"
          color="success"
          data-cy="releaseActivateBtn"
          disabled={loading}
          sx={{ mt: 4 }}
          size="large"
          onClick={handleActivate}
          startIcon={loading ? <CircularProgress size="20px" /> : <AddIcon />}
        >
          {t("release.activateButton")}
        </Button>
      </div>
    </Box>
  );
}
