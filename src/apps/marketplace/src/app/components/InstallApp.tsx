import { Stack, Box, Typography, Button } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import zestyRocket from "../../../../../../public/images/zestyRocket.svg";
import microsoftIcon from "../../../../../../public/images/microsoftLogo.png";
import googleAnalyticsIcon from "../../../../../../public/images/googleAnalyticsLogo.png";
import npmIcon from "../../../../../../public/images/npmLogo.png";
import nodejsIcon from "../../../../../../public/images/nodejsLogo.png";
import googleChromeIcon from "../../../../../../public/images/googleChromeLogo.png";

const ICONS: { altText: string; image: any }[] = [
  {
    altText: "Microsoft Logo",
    image: microsoftIcon,
  },
  {
    altText: "Google Analytics Logo",
    image: googleAnalyticsIcon,
  },
  {
    altText: "NPM Logo",
    image: npmIcon,
  },
  {
    altText: "NodeJS Logo",
    image: nodejsIcon,
  },
  {
    altText: "Google Chrome Logo",
    image: googleChromeIcon,
  },
];

export const InstallApp = () => {
  return (
    <Stack height="100%" justifyContent="center" alignItems="center">
      <Box component="img" src={zestyRocket} alt="Zesty Rocket logo" mb={3} />
      <Stack direction="row" gap={1} mb={8}>
        {ICONS.map((icon) => (
          <Box
            component="img"
            src={icon.image}
            alt={icon.altText}
            width={96}
            height={96}
          />
        ))}
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
