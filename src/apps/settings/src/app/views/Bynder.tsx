import { useEffect, useState } from "react";
import {
  ThemeProvider,
  Box,
  Stack,
  Typography,
  Button,
  Backdrop,
  Dialog,
} from "@mui/material";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import { theme } from "@zesty-io/material";
import { CompactView, Modal, Login } from "@bynder/compact-view";

import bynderPreview from "../../../../../../public/images/bynder-preview.png";
import bynderLogo from "../../../../../../public/images/bynder-logo.svg";

// TODO: Get the the cvad from local storage to determine the bynder url
// NOTE: cvrt is the bynder refresh token, determines if user is logged in or not
export const Bynder = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isBynderSessionValid, setIsBynderSessionValid] = useState(false);
  const [bynderSessionUrl, setBynderSessionUrl] = useState("");

  useEffect(() => {
    // Immediately check bynder session details on mount
    let validSession = !!localStorage.getItem("cvrt");
    let bynderUrl = localStorage.getItem("cvad");

    setIsBynderSessionValid(validSession);
    setBynderSessionUrl(bynderUrl);

    // Poll bynder session details in case the user has logged in/out in bynder
    const bynderSessionInterval = setInterval(() => {
      validSession = !!localStorage.getItem("cvrt");

      if (validSession) {
        setIsLoginOpen(false);
      }

      setIsBynderSessionValid(validSession);
      setBynderSessionUrl(bynderUrl);
    }, 500);

    return () => clearInterval(bynderSessionInterval);
  }, []);

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
            <Box mt={2} mb={2.5}>
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
                  // Remove the bynder dam url and bynder refresh token
                  localStorage.removeItem("cvad");
                  localStorage.removeItem("cvrt");
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
                  // Remove the bynder refresh token
                  localStorage.removeItem("cvrt");
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
                borderRadius: 1,
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
