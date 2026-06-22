import { Box, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { getTypeText, getFieldCopyConfig, FieldType } from "../configs";
import { stringStartsWithVowel, getCategory } from "../../utils";

interface Props {
  type: FieldType;
}
export const Learn = ({ type }: Props) => {
  const { t } = useTranslation();
  const TYPE_TEXT = getTypeText(t);
  const FIELD_COPY_CONFIG = getFieldCopyConfig(t);
  const category = getCategory(type);
  const data = FIELD_COPY_CONFIG[category]?.find((item) => item.type === type);

  return (
    <Stack data-cy="LearnTab" gap={1.25}>
      <Box>
        <Typography variant="h5" fontWeight={600} mb={0.5}>
          {stringStartsWithVowel(TYPE_TEXT[type])
            ? t("schema.whatIsAnFieldType", { fieldType: TYPE_TEXT[type] })
            : t("schema.whatIsAFieldType", { fieldType: TYPE_TEXT[type] })}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          whiteSpace="pre-line"
        >
          {data?.description}
        </Typography>
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {t("schema.commonUses")}
        </Typography>
        <Box component="ul" pl={3}>
          {data?.commonUses.map((string, index) => (
            <Typography
              key={index}
              component="li"
              variant="body1"
              color="text.secondary"
            >
              {string}
            </Typography>
          ))}
        </Box>
      </Box>
      {type === "repeater" && (
        <Box>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            {t("schema.howIsDataStored")}
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={0.5}>
            {t("schema.repeaterDataStorageDescription")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {
              'e.g. [{quote: "ACME has solved all my needs", name: "Jane Doe"}, {quote: "I love ACME!", name: "John Doe"}]'
            }
          </Typography>
        </Box>
      )}
      <Box>
        <Typography variant="h6" fontWeight={600} mb={0.5}>
          {t("schema.proTip")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {data?.proTip}
        </Typography>
      </Box>
    </Stack>
  );
};
