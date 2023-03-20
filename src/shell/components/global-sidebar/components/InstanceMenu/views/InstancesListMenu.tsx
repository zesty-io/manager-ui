import { FC, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  TextField,
  IconButton,
  Divider,
  ListSubheader,
  MenuItem,
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
  const [filter, setFilter] = useState("");
  const user: User = useSelector((state: AppState) => state.user);
  const { data: instances } = useGetInstancesQuery();

  const favoriteInstances = useMemo(() => {
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

  const filteredFavoriteInstances = useMemo(() => {
    if (filter) {
      return favoriteInstances?.filter((site) =>
        site.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return favoriteInstances;
  }, [filter, favoriteInstances]);

  const filteredInstances = useMemo(() => {
    if (filter) {
      return instances?.filter((instance) =>
        instance.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return instances;
  }, [filter, instances]);

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
          autoFocus
          fullWidth
          placeholder="Search Instances"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
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
      {filteredFavoriteInstances?.map((instance) => (
        <MenuItem onClick={() => handleSwitchInstance(instance.ZUID)}>
          <ListItemText>{instance.name}</ListItemText>
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
      {filteredInstances?.map((instance) => (
        <MenuItem onClick={() => handleSwitchInstance(instance.ZUID)}>
          <ListItemText>{instance.name}</ListItemText>
        </MenuItem>
      ))}
    </>
  );
};
