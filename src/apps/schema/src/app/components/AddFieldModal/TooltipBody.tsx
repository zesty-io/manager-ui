import {
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";
import { stringStartsWithVowel } from "../../utils";

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
          primary={headerText}
          secondary="FAQ"
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: 700,
            color: "text.primary",
          }}
          secondaryTypographyProps={{
            variant: "body3",
          }}
        />
      </ListItem>
      <Box px={2} py={1}>
        <Typography
          variant="body3"
          color="text.secondary"
          whiteSpace="pre-line"
          fontWeight={400}
        >
          {description}
        </Typography>
        <Box py={2}>
          <Typography variant="body2" fontWeight="700" pb={1}>
            Common Uses
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
        <Typography variant="body2" fontWeight="700" pb={1}>
          Pro Tip
        </Typography>
        <Typography fontWeight={400} variant="body3" color="text.secondary">
          {proTip}
        </Typography>
      </Box>
    </Paper>
  );
};
