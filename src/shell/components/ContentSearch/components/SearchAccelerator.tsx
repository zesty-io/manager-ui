import { FC } from "react";
import {
  ListItem,
  ListSubheader,
  Button,
  SvgIcon,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";

import { SEARCH_ACCELERATORS } from "./config";
import { ResourceType } from "../../../services/types";
import { useGetActiveApp } from "../../../hooks/useGetActiveApp";

interface SearchAcceleratorProps {
  onAcceleratorClick: (type: ResourceType) => void;
}
export const SearchAccelerator: FC<SearchAcceleratorProps> = ({
  onAcceleratorClick,
}) => {
  const { mainApp } = useGetActiveApp();
  const isValidApp = Boolean(SEARCH_ACCELERATORS[mainApp as ResourceType]);

  return (
    <>
      {isValidApp && (
        <ListItem
          sx={{
            height: "36px",
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => onAcceleratorClick(mainApp as ResourceType)}
        >
          <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
            <ManageSearchRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={`Find in ${
              SEARCH_ACCELERATORS[mainApp as ResourceType].text
            }`}
            primaryTypographyProps={{
              variant: "body2",
              color: "text.secondary",
            }}
          />
        </ListItem>
      )}
      <ListSubheader
        sx={{
          fontSize: "12px",
          fontWeight: 600,
          lineHeight: "18px",
          letterSpacing: "0.15px",
          pt: isValidApp ? 0 : 1,
        }}
      >
        I'm looking for...
      </ListSubheader>
      <ListItem
        sx={{
          gap: 1,
          pt: 0.5,
        }}
      >
        {Object.entries(SEARCH_ACCELERATORS)?.map(([key, value]) => (
          <Button
            key={key}
            variant="contained"
            size="small"
            sx={{
              height: "24px",
              letterSpacing: "0.16px",
              lineHeight: "18px",
              fontSize: "13px",
              fontWeight: 400,
            }}
            startIcon={<SvgIcon component={value.icon} />}
            onClick={() => onAcceleratorClick(key as ResourceType)}
          >
            {value.text}
          </Button>
        ))}
      </ListItem>
    </>
  );
};
