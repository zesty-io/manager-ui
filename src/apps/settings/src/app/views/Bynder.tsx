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
import { theme } from "@zesty-io/material";
import { CompactView, Modal, Login } from "@bynder/compact-view";
import { useCookie } from "react-use";

import bynderPreview from "../../../../../../public/images/bynder-preview.png";
import bynderLogo from "../../../../../../public/images/bynder-logo.svg";

// TODO: Check with zosh if we still needs this since it's redundant due to how bynder's component handles the cookie
// TODO: If still needed, figure out a way to listen for cookie changes to determine if the user has logged in to bynder yet
export const Bynder = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [bynderCookie] = useCookie("bynder");

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
        <Stack direction="row" gap={6} px={4} height="100%" alignItems="center">
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
        <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
          <Login>
            <CompactView />
          </Login>
        </Modal>
      </Stack>
    </ThemeProvider>
  );
};
