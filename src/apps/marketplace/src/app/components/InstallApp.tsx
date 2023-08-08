import { Stack, Box, Typography, Button } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import zestyRocket from "../../../../../../public/images/zestyRocket.svg";
import microsoftIcon from "../../../../../../public/images/microsoftIcon.svg";
import googleAnalyticsIcon from "../../../../../../public/images/googleAnalyticsIconOnly.svg";
import npmIcon from "../../../../../../public/images/npmIcon.svg";
import nodejsIcon from "../../../../../../public/images/nodejsIcon.svg";
import googleChromeIcon from "../../../../../../public/images/googleChromeIcon.svg";

export const InstallApp = () => {
  return (
    <Stack height="100%" justifyContent="center" alignItems="center">
      <Box component="img" src={zestyRocket} alt="Zesty Rocket logo" mb={3} />
      <Stack direction="row" gap={1} mb={8}>
        <Box
          component="img"
          src={microsoftIcon}
          alt="Microsoft Logo"
          width={48}
          height={48}
          margin={3}
        />
        <Box
          component="img"
          src={googleAnalyticsIcon}
          alt="Google Anayltics Logo"
          width={48}
          height={48}
          margin={3}
        />
        <Box
          component="img"
          src={npmIcon}
          alt="NPM Logo"
          width={48}
          height={48}
          margin={3}
        />
        <Box
          component="img"
          src={nodejsIcon}
          alt="NodeJS Logo"
          width={48}
          height={48}
          margin={3}
        />
        <Box
          component="img"
          src={googleChromeIcon}
          alt="Google Chrome Logo"
          width={48}
          height={48}
          margin={3}
        />
      </Stack>
      <Typography variant="h3" mb={1} fontWeight={600}>
        Explore Marketplace
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        mb={3}
        width={387}
        textAlign="center"
      >
        Install extensions, applications, and quick start modules to accelerate
        your Zesty project
      </Typography>
      <Button
        variant="contained"
        startIcon={<StorefrontRoundedIcon />}
        onClick={() =>
          window.open("https://www.zesty.io/marketplace/apps/", "_blank")
        }
      >
        Go to Marketplace
      </Button>
    </Stack>
  );
};
