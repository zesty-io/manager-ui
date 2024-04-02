import { useEffect, useState } from "react";
import { ThemeProvider, Box, Stack, Typography, Button } from "@mui/material";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import { theme } from "@zesty-io/material";
import { Modal, Login } from "@bynder/compact-view";

import bynderPreview from "../../../../../../public/images/bynder-preview.png";
import bynderLogo from "../../../../../../public/images/bynder-logo.svg";
import {
  useCreateInstanceSettingsMutation,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingMutation,
} from "../../../../../shell/services/instance";

// NOTE: cvrt is the bynder refresh token, determines if user is logged in or not
export const Bynder = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBynderSessionValid, setIsBynderSessionValid] = useState(false);
  const [bynderSessionUrl, setBynderSessionUrl] = useState("");
  const [createInstanceSetting] = useCreateInstanceSettingsMutation();
  const [updateInstanceSetting] = useUpdateInstanceSettingMutation();
  const { data: rawInstanceSettings } = useGetInstanceSettingsQuery();
  const [tokenInterval, setTokenInterval] = useState<NodeJS.Timer>();
  const [portalUrlInterval, setPortalUrlInterval] = useState<NodeJS.Timer>();

  const bynderPortalUrlSetting = rawInstanceSettings?.find(
    (setting) => setting.key === "bynder_portal_url"
  );
  const bynderTokenSetting = rawInstanceSettings?.find(
    (setting) => setting.key === "bynder_token"
  );

  const updateBynderPortalUrl = (url: string) => {
    if (bynderPortalUrlSetting) {
      updateInstanceSetting({
        ...bynderPortalUrlSetting,
        value: url,
      });
    } else {
      createInstanceSetting({
        category: "bynder",
        key: "bynder_portal_url",
        keyFriendly: "Bynder Portal URL",
        value: url,
        dataType: "text",
      });
    }

    localStorage.setItem("cvad", url);
  };

  const updateBynderToken = (token: string) => {
    if (bynderTokenSetting) {
      updateInstanceSetting({
        ...bynderTokenSetting,
        value: token,
      });
    } else {
      createInstanceSetting({
        category: "bynder",
        key: "bynder_token",
        keyFriendly: "Bynder Token",
        value: token,
        dataType: "text",
      });
    }

    if (token) {
      localStorage.setItem("cvrt", token);
    } else {
      localStorage.removeItem("cvrt");
    }
  };

  useEffect(() => {
    let bynderUrl = localStorage.getItem("cvad");

    setBynderSessionUrl(bynderUrl);

    // Poll bynder session details in case the user has logged in/out in bynder
    const bynderSessionInterval = setInterval(() => {
      bynderUrl = localStorage.getItem("cvad");

      if (bynderUrl === null && bynderPortalUrlSetting?.value) {
        localStorage.setItem("cvad", bynderPortalUrlSetting?.value);
        setBynderSessionUrl(bynderPortalUrlSetting?.value);
      } else if (bynderUrl && bynderUrl !== bynderPortalUrlSetting?.value) {
        updateBynderPortalUrl(bynderUrl);
        setBynderSessionUrl(bynderUrl);
      }
    }, 500);

    setPortalUrlInterval(bynderSessionInterval);

    return () => clearInterval(bynderSessionInterval);
  }, [bynderPortalUrlSetting]);

  useEffect(() => {
    let bynderToken = localStorage.getItem("cvrt");

    setIsBynderSessionValid(!!bynderToken);

    // Poll bynder session details in case the user has logged in/out in bynder
    const bynderSessionInterval = setInterval(() => {
      bynderToken = localStorage.getItem("cvrt");

      if (!!bynderToken) {
        setIsLoginOpen(false);
      }

      setIsBynderSessionValid(!!bynderToken);

      if (bynderToken === null && bynderTokenSetting?.value) {
        localStorage.setItem("cvrt", bynderTokenSetting.value);
        setIsBynderSessionValid(!!bynderTokenSetting.value);
      } else if (bynderToken && bynderToken !== bynderTokenSetting?.value) {
        updateBynderToken(bynderToken);
        setIsBynderSessionValid(!!bynderToken);
      }
    }, 500);

    setTokenInterval(bynderSessionInterval);

    return () => clearInterval(bynderSessionInterval);
  }, [bynderTokenSetting]);

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100%" bgcolor="grey.50">
        <Box
          px={4}
          pt={4}
          pb={2}
          bgcolor="common.white"
          borderBottom="2px solid"
          borderColor="border"
        >
          <Typography variant="h3" fontWeight={700} color="text.primary">
            Bynder Integration
          </Typography>
        </Box>
        {isBynderSessionValid ? (
          <Box px={4} pt={2}>
            <Box component="img" src={bynderLogo} width={150} height={33} />
            <Box my={2}>
              <Typography fontWeight={700} variant="h5" color="text.primary">
                Your instance is connected to the following Bynder Portal
              </Typography>
              <Typography fontWeight={600} variant="h5" color="primary.main">
                {bynderSessionUrl}
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  clearInterval(portalUrlInterval);
                  clearInterval(tokenInterval);
                  updateBynderPortalUrl("");
                  updateBynderToken("");
                  setIsLoginOpen(true);
                }}
              >
                Change Bynder Portal
              </Button>
              <Button
                startIcon={<PersonRemoveRoundedIcon />}
                color="error"
                variant="contained"
                onClick={() => {
                  clearInterval(tokenInterval);
                  updateBynderToken("");
                }}
              >
                Disconnect
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack
            direction="row"
            gap={6}
            px={4}
            height="100%"
            alignItems="center"
          >
            <Box>
              <Box
                component="img"
                src={bynderLogo}
                alt="Bynder logo"
                width={150}
                height={33}
                mb={3}
              />
              <Typography
                variant="h4"
                fontWeight={700}
                color="text.primary"
                mb={1}
              >
                Use your Bynder Assets within Zesty
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Streamline your workflow by giving your team easy access to your
                Bynder assets within Zesty
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => setIsLoginOpen(true)}
              >
                Connect to Bynder
              </Button>
            </Box>
            <Box
              component="img"
              src={bynderPreview}
              alt="Bynder preview"
              sx={{
                height: 480,
                width: 768,
                borderRadius: 2,
              }}
            />
          </Stack>
        )}
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login>
            {/** HACK: Bynder's Login component requires a child*/}
            <></>
          </Login>
        </Modal>
      </Stack>
    </ThemeProvider>
  );
};
