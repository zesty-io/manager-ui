import { useState } from "react";
import { Avatar, Box, Button, Dialog, Typography } from "@mui/material";

export const OnboardingCall = () => {
  const [showMeetModal, setShowMeetModal] = useState(false);

  return (
    <>
      <Box
        px={1.5}
        py={3.25}
        mt={2.5}
        borderTop="1px solid"
        borderColor="grey.800"
      >
        <Avatar
          src="https://zestyio.media.zestyio.com/gisele-blair-zestyio.jpeg?width=64&height=64"
          alt="Sales Avatar"
          sx={{
            width: "32px",
            height: "32px",
          }}
        />
        <Typography variant="h6" color="common.white" my={1.5}>
          Schedule an onboarding call with our support team
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setShowMeetModal(true)}
          size="small"
        >
          Schedule a call
        </Button>
      </Box>
      <Dialog open={showMeetModal} onClose={() => setShowMeetModal(false)}>
        <iframe
          width="364"
          height="800"
          src="https://zesty.zohobookings.com/portal-embed#/customer/3973976000000039370"
        ></iframe>
      </Dialog>
    </>
  );
};
