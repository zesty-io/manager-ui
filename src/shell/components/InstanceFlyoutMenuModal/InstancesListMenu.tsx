import { useEffect, useState, useMemo } from "react";
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
  instanceAvatarColors?: Array<string>;
}

const InstancesListMenu = ({
  onClose,
  instanceZUID,
  instanceAvatarColors,
}: Props) => {
  const instances = useSelector((state: any) => state.instances);
  const [searchInstance, setSearchInstance] = useState("");

  const filteredInstances = useMemo(
    () =>
      instances.filter((instance: any) => {
        return instance.name
          .toLowerCase()
          .includes(searchInstance.toLowerCase());
      }),
    [searchInstance]
  );

  return (
    <>
      <Box sx={{ p: 2 }}>
        <TextField
          placeholder="Search Instances"
          value={searchInstance}
          onChange={(evt) => {
            setSearchInstance(evt.target.value);
          }}
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
        {filteredInstances.map((instance: any, key: number) => (
          <>
            <ListItem
              sx={{
                cursor: "pointer",
              }}
              onClick={() => {
                // @ts-ignore
                window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}`;
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
                  {instance?.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={instance?.name}
                primaryTypographyProps={{
                  variant: "body2",
                }}
              />
            </ListItem>
            <Divider />
          </>
        ))}
      </Box>
    </>
  );
};

export default InstancesListMenu;
