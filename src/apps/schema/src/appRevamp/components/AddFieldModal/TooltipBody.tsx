import {
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";
import { stringStartsWithVowel } from "../utils";

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
  const headerText = stringStartsWithVowel(fieldName)
    ? `What is an ${fieldName} Field?`
    : `What is a ${fieldName} Field?`;

  return (
    <Paper
      sx={{
        maxWidth: "420px",
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
          primary={headerText}
          secondary="FAQ"
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: 700,
          }}
          secondaryTypographyProps={{
            // @ts-expect-error missing body3 module augmentation
            variant: "body3",
          }}
        />
      </ListItem>
      <Box px={2} py={1}>
        <Typography
          // @ts-expect-error missing body3 module augmentation
          variant="body3"
          color="text.secondary"
        >
          {description}
        </Typography>
        <Box py={2}>
          <Typography variant="body2" fontWeight="700">
            Common Uses
          </Typography>
          <Box pl={2} component="ul">
            {commonUses.map((string, index) => (
              <Typography
                // @ts-expect-error missing body3 module augmentation
                variant="body3"
                color="text.secondary"
                component="li"
                key={index}
              >
                {string}
              </Typography>
            ))}
          </Box>
        </Box>
        <Typography variant="body2" fontWeight="700">
          Pro Tip
        </Typography>
        <Typography
          // @ts-expect-error missing body3 module augmentation
          variant="body3"
          color="text.secondary"
        >
          {proTip}
        </Typography>
      </Box>
    </Paper>
  );
};
