import {
  Box,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from "@mui/material";

import { FieldIcon } from "../Field/FieldIcon";
import { TooltipBody } from "./TooltipBody";

interface Props {
  fieldName: string;
  shortDescription: string;
  fieldType: string;
  description: string;
  commonUses: string[];
  proTip: string;
  onFieldClick: () => void;
}

export const FieldItem = ({
  fieldName,
  shortDescription,
  fieldType,
  description,
  commonUses,
  proTip,
  onFieldClick,
}: Props) => {
  return (
    <Box
      height="62px"
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
      boxSizing="border-box"
    >
      <Tooltip
        enterDelay={1000}
        enterNextDelay={1000}
        title={
          <TooltipBody
            fieldName={fieldName}
            fieldType={fieldType}
            description={description}
            commonUses={commonUses}
            proTip={proTip}
          />
        }
        components={{ Tooltip: Box }}
        followCursor
      >
        <ListItem
          sx={{
            py: 1,
            px: 2,
            height: "62px",
          }}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <FieldIcon type={fieldType} />
          </ListItemIcon>
          <ListItemText
            primary={fieldName}
            secondary={shortDescription}
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
      </Tooltip>
    </Box>
  );
};
