import { FC } from "react";
import { useLocation, Link as Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PinIcon from "@mui/icons-material/PushPin";
import OutlinedPinIcon from "@mui/icons-material/PushPinOutlined";

import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Input from "@mui/material/Input";

import {
  pinTab,
  unpinTab,
  unpinManyTabs,
  loadTabs,
  rebuildTabs,
  parsePath,
  Tab,
  createTab,
  tabLocationEquality,
} from "../../../../shell/store/ui";
export type TopTab = {
  tab: Tab;
  tabWidth: number;
  isPinned: boolean;
  onClick: () => void;
};
export const TopTab: FC<TopTab> = ({ tab, tabWidth, isPinned, onClick }) => {
  const isActiveTab = tabLocationEquality(tab, location);
  console.log(tab);
  const tabProps = {};
  const Pin = isPinned ? PinIcon : OutlinedPinIcon;
  return (
    <Box
      component="li"
      sx={{
        borderWidth: "1px",
        borderColor: "grey.800",
        // TODO how to pull from theme?
        borderRadius: "12px 12px 0px 0px",
        padding: 1.5,
        gap: 1,
        backgroundColor: isActiveTab ? "white" : "grey.800",

        width: `${tabWidth}px`,
        // taken from old less
        alignItems: "center",
        display: "flex",
        flexShrink: 0,
      }}
      {...tabProps}
    >
      <MuiLink
        component={Link}
        to={tab.pathname + tab.search}
        sx={{
          color: "grey.400",
          justifyContent: "space-between",
          // taken from old less
          width: "100%",
          display: "inline-block",
          maxWidth: "300px",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          textShadow: "none",
          wordBreak: "keep-all",
          transitionDuration: "unset",
          transitionProperty: "unset",
        }}
      >
        {tab.icon && <FontAwesomeIcon icon={tab.icon} />}
        &nbsp;
        {tab.name ? tab.name : `${tab.pathname.slice(1)}`}
      </MuiLink>
      <Box component="span" onClick={onClick} sx={{ cursor: "pointer" }}>
        <Pin
          fontSize="small"
          sx={{ transform: "rotate(45deg)", marginRight: 0.25 }}
        />
      </Box>
    </Box>
  );
};
