import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export const ComingSoon = () => {
  const { t } = useTranslation();
  return (
    <Box
      data-cy="RulesTab"
      display="flex"
      flexDirection="column"
      height="100%"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        gap="20px"
      >
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">{t("schema.uniqueField")}</Typography>
              <Typography variant="body3" color="text.secondary">
                {t("schema.uniqueFieldDescription")}
              </Typography>
            </>
          }
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">I am a hardcoded string</Typography>
              <Typography variant="body3" color="text.secondary">
                {t("schema.defaultValueDescription")}
              </Typography>
            </>
          }
        />
        <FormControlLabel
          control={<Checkbox disabled />}
          label={
            <>
              <Typography variant="body2">
                {t("schema.limitCharacterCount")}
              </Typography>
              <Typography variant="body3" color="text.secondary">
                {t("schema.limitCharacterCountDescription")}
              </Typography>
            </>
          }
        />
      </Box>
      <Typography variant="h5" mt={4} mb={1.5} fontWeight={600}>
        {t("schema.fieldValidationTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t("schema.comingSoon")}
      </Typography>
    </Box>
  );
};
