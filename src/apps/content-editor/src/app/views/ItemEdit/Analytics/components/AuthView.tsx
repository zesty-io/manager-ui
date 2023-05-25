import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import googleAnalyticsIcon from "../../../../../../../../../public/images/googleAnalyticsIcon.svg";
import contentAnalytics from "../../../../../../../../../public/images/contentAnalytics.svg";
import googleIcon from "../../../../../../../../../public/images/googleIcon.svg";
import { AnalyticsDialog } from "./AnalyticsDialog";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import instanceZUID from "../../../../../../../../utility/instanceZUID";

let tabWindow: Window;

type Message = {
  source: "zesty";
  status: number;
};

type Props = {
  validateAuth: () => void;
};

export const AuthView = ({ validateAuth }: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const instance = useSelector((state: AppState) => state.instance);
  const [showResult, setShowResult] = useState(null);

  const receiveMessage = (event: MessageEvent<Message>) => {
    if (
      // @ts-ignore
      event.origin === CONFIG.CLOUD_FUNCTIONS_DOMAIN &&
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
      // @ts-ignore
      `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/authenticateGoogleAnalytics?user_id=${user.ID}&account_id=${instance.ID}`
    );
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  return (
    <>
      <Box display="flex" gap={4} alignItems="center" height="100%">
        <Box flex={1}>
          <img src={googleAnalyticsIcon} alt="googleAnalyticsIcon" />
          <Typography variant="h4" fontWeight="600" mt={3}>
            Connect to Google Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
            Learn where your pages traffic comes from and how it changes based
            on changes made to content. To start, please authenticate with the
            Google account your Google Analytics is connected to.
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<img src={googleIcon} width="20" height="20" />}
              onClick={initiate}
            >
              Authenticate with Google
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => window.open("https://www.google.com")}
            >
              Learn More
            </Button>
          </Box>
        </Box>
        <Box flex={1}>
          <img src={contentAnalytics} alt="contentAnalytics" />
        </Box>
      </Box>
      {showResult === true && (
        <AnalyticsDialog
          title={`Congratulations ${user.firstName}! You are successfully connected to Google Analytics`}
          subTitle="Get ready to gain insights on how your content changes have impacted your page traffic and more!"
          buttons={
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setShowResult(null);
                validateAuth();
              }}
            >
              Get Started
            </Button>
          }
        />
      )}
      {showResult === false && (
        <AnalyticsDialog
          title={`Oops, we were unable to successfully connect to Google Analytics`}
          subTitle="This can because you may have selected a Google account that does not have Google Analytics setup."
          buttons={
            <>
              <Button
                variant="contained"
                color="inherit"
                size="large"
                onClick={() => setShowResult(null)}
              >
                Cancel
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
                Try Again
              </Button>
            </>
          }
        />
      )}
    </>
  );
};
