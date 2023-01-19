import { useEffect } from "react";
import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchInstalledApps } from "../../../../../shell/store/apps";
import SearchIcon from "@mui/icons-material/Search";
import { AppState } from "../../../../../shell/store/types";
import { useHistory } from "react-router";
import { useLocation } from "react-router-dom";
import PowerIcon from "@mui/icons-material/Power";

export const Sidebar = () => {
  // const installedApps = useSelector((state: AppState) => state.apps.installed);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const installedApps = [
    {
      ZUID: "80-d8abaff6ef-wxs830",
      createdAt: "2022-06-24T14:00:57Z",
      createdByUserZUID: "5-44ccc74-sn4pc4st3r",
      description: "",
      label: "Analytics",
      name: "google-analytics",
      public: true,
      publisher: "Zesty.io",
      updatedAt: "2022-07-29T14:26:23Z",
      url: "https://apps.zesty.io/google-analytics/",
    },
  ];

  useEffect(() => {
    dispatch(fetchInstalledApps());
    if (installedApps.length) {
      history.push(`/marketplace/app/${installedApps[0]?.ZUID}`);
    }
  }, []);

  return (
    <Box
      sx={{
        borderWidth: "0px",
        borderRightWidth: "1px",
        borderColor: "border",
        borderStyle: "solid",
        minWidth: "220px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <Typography variant="h4">Marketplace</Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon fontSize="small" />}
          onClick={() =>
            window.open("https://www.zesty.io/marketplace/apps/", "_blank")
          }
          sx={{ mt: 2, width: "100%" }}
        >
          <Typography
            // @ts-ignore
            variant="body3"
          >
            Browse Marketplace
          </Typography>
        </Button>
      </Box>
      {installedApps.map((app: any) => {
        return (
          <MenuItem
            onClick={() => history.push(`/marketplace/app/${app.ZUID}`)}
            selected={location.pathname === `/marketplace/app/${app.ZUID}`}
            sx={{
              mt: 1,
              borderRadius: "4px",
              "&.Mui-selected .MuiListItemIcon-root ": {
                color: "primary.main",
              },
              "&.Mui-selected .MuiTypography-root": {
                color: "primary.dark",
              },
            }}
          >
            <ListItemIcon>
              <PowerIcon />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                // @ts-ignore
                variant: "body3",
                color: "text.secondary",
              }}
              primary={app.label}
            />
          </MenuItem>
        );
      })}
    </Box>
  );
};
