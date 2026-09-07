import {
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Stack,
} from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";
import { stringStartsWithVowel } from "../../utils";
import { useTranslation } from "react-i18next";

interface Props {
  fieldName: string;
  fieldType: string;
  description: string;
  commonUses: string[];
  proTip: string;
}
export const TooltipBody = ({
  fieldName,
  fieldType,
  description,
  commonUses,
  proTip,
}: Props) => {
  const { t } = useTranslation();

  const headerText = stringStartsWithVowel(fieldName)
    ? t("schema.tooltipWhatIsAnField", { fieldName })
    : t("schema.tooltipWhatIsAField", { fieldName });

  return (
    <Paper
      sx={{
        width: "420px",
      }}
    >
      <ListItem
        sx={{
          py: 1,
          px: 2,
          borderBottom: 1,
          borderColor: "border",
        }}
      >
        <ListItemIcon sx={{ minWidth: "36px" }}>
          <FieldIcon type={fieldType} />
        </ListItemIcon>
        <ListItemText
          primary={fieldName}
          secondary={t("schema.faqBadge")}
          slotProps={{
            primary: {
              fontWeight: 700,
              color: "text.primary",
              variant: "body2",
            },
            secondary: {
              variant: "body3",
            },
          }}
          sx={{
            my: 0.5,
          }}
        />
      </ListItem>
      <Stack>
        <Box px={2} py={1}>
          <Typography variant="body2" fontWeight="700" pb={0.5}>
            {headerText}
          </Typography>
          <Typography
            variant="body3"
            color="text.secondary"
            whiteSpace="pre-line"
            fontWeight={400}
          >
            {description}
          </Typography>
        </Box>
        <Box px={2} py={1}>
          <Typography variant="body2" fontWeight="700" pb={0.5}>
            {t("schema.commonUses")}
          </Typography>
          <Box pl={3} component="ul">
            {commonUses.map((string, index) => (
              <Typography
                variant="body3"
                color="text.secondary"
                component="li"
                key={index}
                sx={{
                  display: "list-item",
                }}
              >
                {string}
              </Typography>
            ))}
          </Box>
        </Box>
        {fieldType === "repeater" && (
          <Box px={2} py={1}>
            <Typography variant="body2" fontWeight="700" pb={0.5}>
              {t("schema.howIsDataStored")}
            </Typography>
            <Typography
              fontWeight={400}
              variant="body3"
              color="text.secondary"
              mb={0.5}
            >
              {t("schema.repeaterDataStorageDescription")}
            </Typography>
            <Typography fontWeight={400} variant="body3" color="text.secondary">
              {
                'e.g. [{quote: "ACME has solved all my needs", name: "Jane Doe"}, {quote: "I love ACME!", name: "John Doe"}]'
              }
            </Typography>
          </Box>
        )}
        <Box px={2} py={1}>
          <Typography variant="body2" fontWeight="700" pb={0.5}>
            {t("schema.proTip")}
          </Typography>
          <Typography fontWeight={400} variant="body3" color="text.secondary">
            {proTip}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
