import { FC, useMemo, useState, useRef, CSSProperties } from "react";
import { useSelector } from "react-redux";
import {
  TextField,
  ListSubheader,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Button,
  Box,
  Tooltip,
  Skeleton,
  Popper,
  Paper,
  MenuList,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { cloneDeep } from "lodash";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { theme } from "@zesty-io/material";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";

import { AppState } from "../../../../../store/types";
import { User, Instance } from "../../../../../services/types";
import { useGetInstancesQuery } from "../../../../../services/accounts";
import noSearchResults from "../../../../../../../public/images/noSearchResults.svg";
import { CascadingMenuItem } from "../../../../CascadingMenuItem";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

interface ListRowData {
  type: "header" | "data" | "skeleton";
  data?: Instance;
  headerText?: string;
}
export const InstancesList = () => {
  const [filter, setFilter] = useState("");
  const searchField = useRef<HTMLInputElement | null>(null);
  const user: User = useSelector((state: AppState) => state.user);
  const { data: instances, isLoading } = useGetInstancesQuery();

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
        site.name?.toLowerCase().includes(filter.toLowerCase())
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
        instance.name?.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return sortedInstances;
  }, [filter, instances]);

  const listData = useMemo(() => {
    let faveInstances: ListRowData[] = [];
    let allInstances: ListRowData[] = [];

    if (filteredFavoriteInstances?.length) {
      faveInstances = filteredFavoriteInstances?.map((instance) => ({
        type: "data" as "header" | "data",
        data: instance,
      }));
    }

    if (isLoading) {
      faveInstances = [...Array(5)].map(() => ({
        type: "skeleton",
      }));
      allInstances = [...Array(10)].map(() => ({
        type: "skeleton",
      }));
    }

    if (filteredInstances?.length) {
      allInstances = filteredInstances?.map((instance) => ({
        type: "data" as "header" | "data",
        data: instance,
      }));
    }

    return [
      {
        type: "header",
        headerText: "Favorites",
      },
      ...faveInstances,
      {
        type: "header",
        headerText: "All Instances",
      },
      ...allInstances,
    ];
  }, [filteredInstances, filteredFavoriteInstances]);

  const handleResetFilter = () => {
    setFilter("");
    searchField.current?.focus();
  };

  return (
    <CascadingMenuItem
      data-cy="InstanceSwitcher"
      MenuItemComponent={
        <>
          <ListItemIcon>
            <ManageSearchRoundedIcon />
          </ListItemIcon>
          <ListItemText>Switch Instance</ListItemText>
          <ArrowForwardIosRoundedIcon color="action" fontSize="small" />
        </>
      }
      PopperProps={{
        popperOptions: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [-16, -8],
              },
            },
          ],
        },
      }}
      PaperProps={{
        sx: {
          /**
           * HACK: Compute min-height depending on how many data are to be rendered (36px each) + search box (72px) + margin top & bottom (16px).
           * Virtualized list won't render when using %-based heights.
           * Maxes out at 540px.
           */
          height: filteredInstances?.length
            ? `min(${16 + 72 + 36 * listData?.length}px, 540px)`
            : 445,
          width: 340,
          borderRadius: "8px",
        },
      }}
    >
      <Stack flexDirection="column" height="inherit" data-cy="InstancesList">
        <ListSubheader
          sx={{
            p: 2,
            borderBottom: "1px solid",
            borderColor: "border",
            height: 72,
            borderRadius: "8px 8px 0px 0px",
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
          <Box
            height="100%"
            sx={{
              ".MuiList-root": {
                marginTop: "8px",
                marginBottom: "8px",
                padding: 0,
              },
            }}
          >
            <AutoSizer>
              {({ height, width }) => (
                <FixedSizeList
                  height={height}
                  width={width}
                  itemCount={listData?.length}
                  itemSize={36}
                  itemData={listData}
                  innerElementType={MenuList}
                >
                  {Row}
                </FixedSizeList>
              )}
            </AutoSizer>
          </Box>
        )}
      </Stack>
    </CascadingMenuItem>
  );
};

interface ListRowProps {
  index: number;
  data: ListRowData[];
  style: CSSProperties;
}
const Row = ({ index, data, style }: ListRowProps) => {
  const instance = data[index];

  const handleSwitchInstance = (ZUID: string) => {
    // @ts-ignore
    window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${ZUID}${CONFIG.URL_MANAGER}`;
  };

  if (instance.type === "skeleton") {
    return (
      <MenuItem sx={style}>
        <Skeleton width="100%" height={36} />
      </MenuItem>
    );
  }

  if (instance.type === "header") {
    const isFave = instance.headerText?.toLowerCase() === "favorites";
    const isAll = instance.headerText?.toLowerCase() === "all instances";

    return (
      <MenuItem
        disableRipple
        sx={{
          borderTop: isAll ? 1 : 0,
          borderColor: "border",
          "&:hover": { cursor: "default", backgroundColor: "transparent" },
          ...style,
        }}
      >
        <ListItemIcon>
          {isFave && <StarIcon />}
          {isAll && <GridViewRoundedIcon />}
        </ListItemIcon>
        <ListItemText>{instance.headerText}</ListItemText>
      </MenuItem>
    );
  }

  if (instance.type === "data") {
    return (
      <MenuItem
        key={instance.data.ZUID}
        onClick={() => handleSwitchInstance(instance.data.ZUID)}
        sx={style}
      >
        <Tooltip
          title={instance.data.name}
          enterDelay={500}
          enterNextDelay={500}
        >
          <ListItemText
            primaryTypographyProps={{
              noWrap: true,
            }}
          >
            {instance.data.name}
          </ListItemText>
        </Tooltip>
      </MenuItem>
    );
  }
};
