import { FC } from "react";
import {
  Stack,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  InputAdornment,
  ListItemButton,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchIcon from "@mui/icons-material/Search";
import BackupTableRoundedIcon from "@mui/icons-material/BackupTableRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import { AppSideBar } from "../../../../../../shell/components/AppSidebar";

export const ContentNav = () => {
  return (
    <AppSideBar
      data-cy="contentNav"
      mode="dark"
      HeaderSubComponent={
        <Stack gap={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={1.5}
          >
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={700}
              lineHeight="24px"
              fontSize={18}
            >
              Content
            </Typography>
            <Button
              variant="contained"
              sx={{
                width: 24,
                height: 24,
                minWidth: 0,
                p: 0,
              }}
            >
              <AddRoundedIcon fontSize="small" />
            </Button>
          </Stack>
          <TextField
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search Content"
            size="small"
            sx={{
              px: 1.5,
            }}
          />
          <List>
            <ListItem
              disablePadding
              selected
              sx={{
                borderLeft: "2px solid",
                borderColor: "primary.main",
                height: 36,
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <BackupTableRoundedIcon />
                </ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </ListItemButton>
            </ListItem>
            <ListItem
              disablePadding
              sx={{
                svg: {
                  color: "grey.400",
                },
                height: 36,
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <ScheduleRoundedIcon />
                </ListItemIcon>
                <ListItemText>Releases</ListItemText>
              </ListItemButton>
            </ListItem>
          </List>
        </Stack>
      }
    />
  );
};
