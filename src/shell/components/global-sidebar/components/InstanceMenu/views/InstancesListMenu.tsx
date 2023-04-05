import { FC, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  TextField,
  IconButton,
  Divider,
  ListSubheader,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Button,
  Box,
  Tooltip,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import StarIcon from "@mui/icons-material/Star";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { cloneDeep } from "lodash";

import { View } from "../DropdownMenu";
import { AppState } from "../../../../../store/types";
import { User, Instance } from "../../../../../services/types";
import { useGetInstancesQuery } from "../../../../../services/accounts";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";

interface InstancesMenuProps {
  onChangeView: (view: View) => void;
}
export const InstancesListMenu: FC<InstancesMenuProps> = ({ onChangeView }) => {
  const [filter, setFilter] = useState("");
  const searchField = useRef<HTMLInputElement | null>(null);
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
    const _instances = cloneDeep(instances);
    const sortedInstances = _instances?.sort((a, b) =>
      a.name?.localeCompare(b.name)
    );

    if (filter) {
      return sortedInstances?.filter((instance) =>
        instance.name.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return sortedInstances;
  }, [filter, instances]);

  const handleSwitchInstance = (ZUID: string) => {
    // @ts-ignore
    window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${ZUID}${CONFIG.URL_MANAGER}`;
  };

  const handleResetFilter = () => {
    setFilter("");
    searchField.current?.focus();
  };

  return (
    <>
      <ListSubheader
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "border",
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
              <IconButton size="small" onClick={() => onChangeView("normal")}>
                <ArrowBackRoundedIcon fontSize="small" />
              </IconButton>
            ),
          }}
          inputRef={searchField}
        />
      </ListSubheader>
      {filter && !filteredInstances?.length ? (
        <Stack
          px={2}
          justifyContent="center"
          alignItems="center"
          textAlign="center"
          height={445}
        >
          <img
            src={noSearchResults}
            alt="No Search Results"
            width={88}
            height={80}
          />
          <Typography variant="h5" fontWeight={600}>
            Your search “{filter}” could not find any results
          </Typography>
          <Typography variant="body2" color="text.secondary" pb={3}>
            Try adjusting tour search. We suggest check all words are spelled
            correctly or try using different keywords.
          </Typography>
          <Button
            variant="contained"
            onClick={handleResetFilter}
            startIcon={<SearchRoundedIcon />}
          >
            Search Again
          </Button>
        </Stack>
      ) : (
        <Box height={519} sx={{ overflowY: "auto" }}>
          <MenuItem
            disableRipple
            sx={{
              mt: 1,
              "&:hover": { cursor: "default", backgroundColor: "transparent" },
            }}
          >
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText>Favorites</ListItemText>
          </MenuItem>
          {filteredFavoriteInstances?.map((instance) => (
            <MenuItem
              key={instance.ZUID}
              onClick={() => handleSwitchInstance(instance.ZUID)}
            >
              <Tooltip
                title={instance.name}
                enterDelay={500}
                enterNextDelay={500}
              >
                <ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                  }}
                >
                  {instance.name}
                </ListItemText>
              </Tooltip>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            disableRipple
            sx={{
              "&:hover": { cursor: "default", backgroundColor: "transparent" },
            }}
          >
            <ListItemIcon>
              <GridViewRoundedIcon />
            </ListItemIcon>
            <ListItemText>All Instances</ListItemText>
          </MenuItem>
          {filteredInstances?.map((instance, index) => (
            <MenuItem
              key={instance.ZUID}
              onClick={() => handleSwitchInstance(instance.ZUID)}
              sx={{
                mb: index + 1 === filteredInstances?.length ? 1 : 0,
              }}
            >
              <Tooltip
                title={instance.name}
                enterDelay={500}
                enterNextDelay={500}
              >
                <ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                  }}
                >
                  {instance.name}
                </ListItemText>
              </Tooltip>
            </MenuItem>
          ))}
        </Box>
      )}
    </>
  );
};
