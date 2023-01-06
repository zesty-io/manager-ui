import {
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";

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
  const headerText = ["a", "e", "i", "o", "u"].includes(
    fieldName[0].toLocaleLowerCase()
  )
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
          py: 1.5,
          px: 2,
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
      <Box px={2}>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos facilis
          amet minima doloremque perferendis perspiciatis tenetur vitae rerum
          reprehenderit. Hic voluptatum porro, eius, architecto atque
          praesentium itaque explicabo dicta sed, modi impedit quo nulla facilis
          nam. Autem possimus tempora veniam?
        </Typography>
      </Box>
    </Paper>
  );
};
