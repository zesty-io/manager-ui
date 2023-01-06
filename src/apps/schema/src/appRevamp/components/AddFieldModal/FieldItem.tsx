import { Box, ListItem, ListItemText, ListItemIcon } from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";

interface Props {
  primaryText?: string;
  secondaryText?: string;
  fieldType?: string;
  onFieldClick?: () => void;
}

export const FieldItem = ({
  primaryText,
  secondaryText,
  fieldType,
  onFieldClick,
}: Props) => {
  return (
    <Box
      minHeight="62px"
      border="1px solid"
      borderColor="border"
      borderRadius={1}
      onClick={onFieldClick}
      sx={{
        "&:hover": {
          backgroundColor: "action.hover",
          cursor: "pointer",
        },
      }}
      bgcolor="common.white"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <ListItem
        sx={{
          py: 1,
          px: 2,
        }}
      >
        <ListItemIcon sx={{ minWidth: "36px" }}>
          <FieldIcon type={fieldType} />
        </ListItemIcon>
        <ListItemText
          primary={primaryText}
          secondary={secondaryText}
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
    </Box>
  );
};
