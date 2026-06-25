import { Typography, Stack, Box, Button } from "@mui/material";
import { GridViewRounded, PeopleRounded } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import restricted from "../../../../public/images/restricted.png";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../store/types";
import { logout } from "../../store/auth";

export const NoInstancePermission = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: AppState) => state.user);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mx={13}
      height="100vh"
    >
      <Box sx={{ maxWidth: 540 }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
          {t("shell.accessDenied")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t("shell.noInstancePermissionBody1")}
          <br />
          <br />
          {t("shell.noInstancePermissionBody2")}{" "}
          <strong>
            {t("shell.currentlyLoggedInAs", { email: user?.email })}
          </strong>
          {" — "}
          {t("shell.trySwitchingAccount")}
        </Typography>
        <Stack direction="row" gap={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GridViewRounded />}
            // @ts-expect-error
            href={`${CONFIG.URL_ACCOUNTS}/instances`}
          >
            {t("shell.viewYourInstances")}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PeopleRounded />}
            onClick={() => {
              dispatch(logout());
            }}
          >
            {t("shell.switchAccount")}
          </Button>
        </Stack>
      </Box>
      <Box
        component="img"
        src={restricted}
        alt={t("shell.noPermissionImageAlt")}
        loading="lazy"
        sx={{
          maxWidth: 320,
        }}
      />
    </Stack>
  );
};
