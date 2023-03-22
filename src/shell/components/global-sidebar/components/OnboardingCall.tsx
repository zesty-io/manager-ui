import { useState } from "react";
import { Avatar, Box, Button, Dialog, Typography, Stack } from "@mui/material";

import salesAvatar from "../../../../../public/images/salesAvatar.png";
import fullZestyLogo from "../../../../../public/images/fullZestyLogo.svg";

export const OnboardingCall = () => {
  const [showMeetModal, setShowMeetModal] = useState(false);

  return (
    <>
      <Box px={2} py={2.5} borderTop="1px solid" borderColor="grey.800">
        <Stack direction="row" justifyContent="space-between">
          <Avatar
            src={salesAvatar}
            alt="Sales Avatar"
            sx={{
              width: "32px",
              height: "32px",
            }}
          />
          <img
            src={fullZestyLogo}
            alt="Full Zesty Logo"
            width={70}
            height={20}
          />
        </Stack>
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
