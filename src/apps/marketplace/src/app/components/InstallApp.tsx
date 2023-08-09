import { Stack, Box, Typography, Button } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import zestyRocket from "../../../../../../public/images/zestyRocket.svg";
import microsoftIcon from "../../../../../../public/images/microsoftLogo.png";
import googleAnalyticsIcon from "../../../../../../public/images/googleAnalyticsLogo.png";
import npmIcon from "../../../../../../public/images/npmLogo.png";
import nodejsIcon from "../../../../../../public/images/nodejsLogo.png";
import googleChromeIcon from "../../../../../../public/images/googleChromeLogo.png";

export const InstallApp = () => {
  return (
    <Stack height="100%" justifyContent="center" alignItems="center">
      <Box component="img" src={zestyRocket} alt="Zesty Rocket logo" mb={3} />
      <Stack direction="row" gap={1} mb={8}>
        <Box
          component="img"
          src={microsoftIcon}
          alt="Microsoft Logo"
          width={96}
          height={96}
        />
        <Box
          component="img"
          src={googleAnalyticsIcon}
          alt="Google Anayltics Logo"
          width={96}
          height={96}
        />
        <Box
          component="img"
          src={npmIcon}
          alt="NPM Logo"
          width={96}
          height={96}
        />
        <Box
          component="img"
          src={nodejsIcon}
          alt="NodeJS Logo"
          width={96}
          height={96}
        />
        <Box
          component="img"
          src={googleChromeIcon}
          alt="Google Chrome Logo"
          width={96}
          height={96}
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
