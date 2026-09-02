import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography } from "@mui/material";

import notFound from "../../../../../../../public/images/notFoundTransparent.png";

interface Props {
  navName: string;
}
export const NavError: FC<Props> = ({ navName }) => {
  const { t } = useTranslation();
  return (
    <Box p={1.5} textAlign="center">
      <img
        src={notFound}
        alt={t("content.notFoundImageAlt")}
        style={{ width: 112, height: 110 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {t("content.navErrorBody", { navName })}
      </Typography>
    </Box>
  );
};
