import { MenuItem, ListItemIcon, ListItemText, MenuList } from "@mui/material";
import BackupTableIcon from "@mui/icons-material/BackupTableRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { useHistory } from "react-router";

export const Menu = () => {
  const history = useHistory();
  return (
    <MenuList sx={{ py: 1, px: 1 }}>
      <MenuItem
        onClick={() => history.push("/media")}
        selected={location.pathname === "/media"}
        sx={{
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
          <BackupTableIcon />
        </ListItemIcon>
        <ListItemText
          //@ts-expect-error body3 additional variant is not on Typography augmentation
          primaryTypographyProps={{ variant: "body3", color: "text.secondary" }}
          primary="All Media"
        />
      </MenuItem>
      <MenuItem
        onClick={() => history.push("/media/insights")}
        selected={location.pathname === "/media/insights"}
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
          <InsightsRoundedIcon />
        </ListItemIcon>
        <ListItemText
          //@ts-expect-error body3 additional variant is not on Typography augmentation
          primaryTypographyProps={{ variant: "body3", color: "text.secondary" }}
          primary="Insights"
        />
      </MenuItem>
    </MenuList>
  );
};
