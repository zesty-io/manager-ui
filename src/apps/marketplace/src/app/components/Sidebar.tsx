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
import SearchIcon from "@mui/icons-material/Search";
import { AppState } from "../../../../../shell/store/types";
import { useHistory } from "react-router";
import PowerIcon from "@mui/icons-material/Power";

export const Sidebar = () => {
  const installedApps = useSelector((state: AppState) => state.apps.installed);
  const history = useHistory();

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
          sx={{ mt: 2 }}
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
            onClick={() => history.push(`/app/${app.ZUID}`)}
            selected={location.pathname === `/app/${app.ZUID}`}
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
              //@ts-expect-error body3 additional variant is not on Typography augmentation
              primaryTypographyProps={{
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
