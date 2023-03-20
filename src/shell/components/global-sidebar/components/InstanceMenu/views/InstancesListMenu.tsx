import { FC, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Divider,
  MenuList,
  ListSubheader,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarIcon from "@mui/icons-material/Star";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";

import { View } from "../DropdownMenu";
import { AppState } from "../../../../../store/types";
import { User, Instance } from "../../../../../services/types";
import { useGetInstancesQuery } from "../../../../../services/accounts";

interface InstancesMenuProps {
  onChangeView: (view: View) => void;
}
export const InstancesListMenu: FC<InstancesMenuProps> = ({ onChangeView }) => {
  const user: User = useSelector((state: AppState) => state.user);
  const { data: instances } = useGetInstancesQuery();

  const favoriteSites = useMemo(() => {
    if (user && instances?.length) {
      let data: Instance[] = [];
      if (user?.prefs) {
        const faveSites: string[] = JSON.parse(user?.prefs)?.favorite_sites;

        faveSites?.forEach((fav) => {
          const res = instances?.filter((instance) => instance.ZUID === fav);
          data.push(...res);
        });
      }
      return data;
    }

    return [];
  }, [user, instances]);

  const handleSwitchInstance = (ZUID: string) => {
    // @ts-ignore
    window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${ZUID}${CONFIG.URL_MANAGER}`;
  };

  return (
    <>
      <ListSubheader
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          height: 72,
        }}
        onKeyDown={(e: React.KeyboardEvent) => {
          const allowedKeys = ["ArrowUp", "ArrowDown", "Escape"];

          if (!allowedKeys.includes(e.key)) {
            e.stopPropagation();
          }
        }}
      >
        <TextField
          fullWidth
          placeholder="Search Instances"
          InputProps={{
            startAdornment: (
              <IconButton onClick={() => onChangeView("normal")}>
                <ArrowBackRoundedIcon />
              </IconButton>
            ),
          }}
        />
      </ListSubheader>
      <MenuItem
        disableRipple
        sx={{
          mt: 1,
          "&:hover": { cursor: "default" },
        }}
      >
        <ListItemIcon>
          <StarIcon />
        </ListItemIcon>
        <ListItemText>Favorites</ListItemText>
      </MenuItem>
      {favoriteSites?.map((site) => (
        <MenuItem onClick={() => handleSwitchInstance(site.ZUID)}>
          <ListItemText>{site.name}</ListItemText>
        </MenuItem>
      ))}
      <Divider />
      <MenuItem
        disableRipple
        sx={{
          "&:hover": { cursor: "default" },
        }}
      >
        <ListItemIcon>
          <GridViewRoundedIcon />
        </ListItemIcon>
        <ListItemText>All Instances</ListItemText>
      </MenuItem>
      {instances?.map((site) => (
        <MenuItem onClick={() => handleSwitchInstance(site.ZUID)}>
          <ListItemText>{site.name}</ListItemText>
        </MenuItem>
      ))}
    </>
  );
};
