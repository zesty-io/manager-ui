import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppState } from "../../../../../../../shell/store/types";
import { useEffect, useState } from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import googleAnalyticsIcon from "../../../../../../../../public/images/googleAnalyticsIcon.svg";
import contentAnalytics from "../../../../../../../../public/images/contentAnalytics.svg";
import contentAnalyticsDashboard from "../../../../../../../../public/images/contentAnalyticsDashboard.svg";
import googleIcon from "../../../../../../../../public/images/googleIcon.svg";
import { AnalyticsDialog } from "./AnalyticsDialog";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

let tabWindow: Window;

type Message = {
  source: "zesty";
  status: number;
};

type Props = {
  validateAuth: () => void;
  isDashboard: boolean;
};

export const AuthView = ({ validateAuth, isDashboard }: Props) => {
  const { t } = useTranslation();
  const user = useSelector((state: AppState) => state.user);
  const instance = useSelector((state: AppState) => state.instance);
  const [showResult, setShowResult] = useState(null);

  const receiveMessage = (event: MessageEvent<Message>) => {
    if (
      event.origin === CONFIG.API_ANALYTICS &&
      event.data.source === "zesty"
    ) {
      if (event.data.status === 200) {
        setShowResult(true);
      } else {
        setShowResult(false);
      }
      tabWindow.close();
    }
  };

  const initiate = () => {
    tabWindow?.close();
    tabWindow = window.open(
      `${CONFIG.API_ANALYTICS}/ga4/auth/connect?user_id=${user.ID}&account_id=${instance.ID}`
    );
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        height: "calc(100vh - 40px)",
      }}
    >
      <Box display="flex" gap={4} alignItems="center" height="100%">
        <Box flex={1}>
          <img src={googleAnalyticsIcon} alt="googleAnalyticsIcon" />
          <Typography variant="h4" fontWeight="600" mt={3}>
            {t("content.analyticsConnectTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
            {t("content.analyticsConnectBody")}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<img src={googleIcon} width="20" height="20" />}
              onClick={initiate}
            >
              {t("content.analyticsAuthenticateGoogle")}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => window.open("https://www.google.com")}
            >
              {t("content.analyticsLearnMore")}
            </Button>
          </Box>
        </Box>
        <Box flex={0}>
          <img
            src={isDashboard ? contentAnalyticsDashboard : contentAnalytics}
            alt="contentAnalytics"
          />
        </Box>
      </Box>
      {showResult === true && (
        <AnalyticsDialog
          title={t("content.analyticsConnectedTitle", {
            name: user.firstName,
          })}
          subTitle={t("content.analyticsConnectedSubtitle")}
          buttons={
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setShowResult(null);
                validateAuth();
              }}
            >
              {t("common.getStarted")}
            </Button>
          }
        />
      )}
      {showResult === false && (
        <AnalyticsDialog
          title={t("content.analyticsConnectErrorTitle")}
          subTitle={t("content.analyticsConnectErrorSubtitle")}
          buttons={
            <>
              <Button
                variant="contained"
                color="inherit"
                size="large"
                onClick={() => setShowResult(null)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  setShowResult(null);
                  initiate();
                }}
              >
                {t("content.analyticsTryAgain")}
              </Button>
            </>
          }
        />
      )}
    </Container>
  );
};
