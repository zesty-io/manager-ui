import { Stack, Box, Typography, Button } from "@mui/material";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { useTranslation } from "react-i18next";

import zestyRocket from "../../../../../../public/images/zestyRocket.svg";
import microsoftIcon from "../../../../../../public/images/microsoftLogo.png";
import googleAnalyticsIcon from "../../../../../../public/images/googleAnalyticsLogo.png";
import npmIcon from "../../../../../../public/images/npmLogo.png";
import nodejsIcon from "../../../../../../public/images/nodejsLogo.png";
import googleChromeIcon from "../../../../../../public/images/googleChromeLogo.png";

const ICONS: { altKey: string; image: any }[] = [
  {
    altKey: "marketplace.microsoftLogoAlt",
    image: microsoftIcon,
  },
  {
    altKey: "marketplace.googleAnalyticsLogoAlt",
    image: googleAnalyticsIcon,
  },
  {
    altKey: "marketplace.npmLogoAlt",
    image: npmIcon,
  },
  {
    altKey: "marketplace.nodejsLogoAlt",
    image: nodejsIcon,
  },
  {
    altKey: "marketplace.googleChromeLogoAlt",
    image: googleChromeIcon,
  },
];

export const InstallApp = () => {
  const { t } = useTranslation();
  return (
    <Stack height="100%" justifyContent="center" alignItems="center">
      <Box
        component="img"
        src={zestyRocket}
        alt={t("marketplace.zestyRocketLogoAlt")}
        mb={3}
      />
      <Stack direction="row" gap={1} mb={8}>
        {ICONS.map((icon) => (
          <Box
            key={icon.altKey.replaceAll(" ", "")}
            component="img"
            src={icon.image}
            alt={t(icon.altKey)}
            width={96}
            height={96}
          />
        ))}
      </Stack>
      <Typography variant="h3" mb={1} fontWeight={600}>
        {t("marketplace.exploreMarketplace")}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        mb={3}
        width={387}
        textAlign="center"
      >
        {t("marketplace.installAppBody")}
      </Typography>
      <Button
        variant="contained"
        startIcon={<StorefrontRoundedIcon />}
        onClick={() =>
          window.open("https://www.zesty.io/marketplace/apps/", "_blank")
        }
      >
        {t("marketplace.goToMarketplace")}
      </Button>
    </Stack>
  );
};
