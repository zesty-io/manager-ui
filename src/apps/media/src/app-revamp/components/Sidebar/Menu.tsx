import { MenuItem, ListItemIcon, ListItemText, MenuList } from "@mui/material";
import BackupTableIcon from "@mui/icons-material/BackupTableRounded";
import { theme } from "@zesty-io/material";
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
          "&.Mui-selected, &.Mui-selected .MuiListItemIcon-root ": {
            color: "primary.dark",
          },
        }}
      >
        <ListItemIcon>
          <BackupTableIcon />
        </ListItemIcon>
        <ListItemText
          //@ts-expect-error body3 additional variant is not on Typography augmentation
          primaryTypographyProps={{ variant: "body3" }}
          primary="All Media"
        />
      </MenuItem>
    </MenuList>
  );
};
