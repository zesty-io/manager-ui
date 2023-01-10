import { DefaultRootState, RootStateOrAny, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
  ListItemAvatar,
  InputAdornment,
  Avatar,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AppState } from "../../../shell/store/types";

interface Props {
  onClose?: () => void;
  instanceZUID?: string;
  favoriteInstances?: any;
  instanceAvatarColors?: Array<string>;
}

const InstancesListMenu = ({
  onClose,
  instanceZUID,
  favoriteInstances,
  instanceAvatarColors,
}: Props) => {
  const instance = useSelector((state: AppState) => state.instance);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <TextField
          placeholder="Search Instances"
          sx={{
            width: "100%",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton sx={{ p: 0 }} onClick={onClose}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box>
        {favoriteInstances.map((favInstance: any, key: number) => (
          <>
            <ListItem
              sx={{
                cursor: "pointer",
              }}
              onClick={() => {
                // @ts-ignore
                window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${favInstance.ZUID}${CONFIG.URL_MANAGER}`;
              }}
            >
              <ListItemAvatar sx={{ minWidth: "45px" }}>
                <Avatar
                  sx={{
                    textTransform: "uppercase",
                    width: 32,
                    height: 32,
                    backgroundColor: instanceAvatarColors[key],
                  }}
                >
                  {favInstance?.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText>{favInstance?.name}</ListItemText>
            </ListItem>
            <Divider />
          </>
        ))}
      </Box>
    </>
  );
};

export default InstancesListMenu;
