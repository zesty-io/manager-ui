import { FC, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Stack,
  Typography,
  ThemeProvider,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { theme } from "@zesty-io/material";

import { useMetaKey } from "../../../../../../../shell/hooks/useMetaKey";
import { ContentModel } from "../../../../../../../shell/services/types";
import { ItemCreateBreadcrumbs } from "./ItemCreateBreadcrumbs";

type DropdownMenuType = "default" | "addNew";
const DropdownMenu: Record<
  DropdownMenuType,
  { createPublishNow: string; createSchedPublish: string }
> = {
  default: {
    createPublishNow: "Create & Publish Now",
    createSchedPublish: "Create & Schedule Publish",
  },
  addNew: {
    createPublishNow: "Create, Publish & Add New",
    createSchedPublish: "Create, Schedule Publish & Add New",
  },
};

interface Props {
  model: ContentModel;
  onSave: (createNew: boolean) => void;
  saving: boolean;
  isDirty: boolean;
}
export const Header: FC<Props> = ({ model, onSave, saving, isDirty }) => {
  const [dropdownMenuType, setDropdownMenuType] =
    useState<DropdownMenuType | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);
  //@ts-ignore Fix type
  const metaShortcut = useMetaKey("s", onSave);

  return (
    <ThemeProvider theme={theme}>
      <>
        <Stack
          px={4}
          pt={4}
          pb={1.75}
          borderBottom="2px solid"
          borderColor="border"
          sx={{ backgroundColor: "background.paper" }}
          direction="row"
          justifyContent="space-between"
          alignItems="flext-start"
        >
          <Stack gap={0.25}>
            <ItemCreateBreadcrumbs />
            <Typography
              variant="h3"
              fontWeight={700}
              color="text.primary"
              sx={{
                display: "-webkit-box",
                "-webkit-line-clamp": "2",
                "-webkit-box-orient": "vertical",
                wordBreak: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
                overflow: "hidden",
              }}
            >
              Create {model.label} Item
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} flexShrink={0} alignItems="flex-start">
            <ButtonGroup
              variant="outlined"
              color="primary"
              size="small"
              disabled={!isDirty || saving}
            >
              <Button
                startIcon={<AddRoundedIcon />}
                onClick={() => onSave(true)}
              >
                Create & Add New
              </Button>
              <Button
                onClick={(evt) => {
                  setAnchorEl(evt.currentTarget);
                  setDropdownMenuType("addNew");
                }}
              >
                <ArrowDropDownRoundedIcon />
              </Button>
            </ButtonGroup>
            <ButtonGroup
              variant="contained"
              color="primary"
              size="small"
              disabled={!isDirty || saving}
              sx={{
                "& .MuiButtonGroup-grouped": {
                  backgroundColor: "primary.main",
                  color: "common.white",

                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                },
              }}
            >
              <Button
                startIcon={<SaveRoundedIcon />}
                onClick={() => onSave(false)}
              >
                Create
              </Button>
              <Button
                onClick={(evt) => {
                  setAnchorEl(evt.currentTarget);
                  setDropdownMenuType("default");
                }}
              >
                <ArrowDropDownRoundedIcon />
              </Button>
            </ButtonGroup>
          </Stack>
        </Stack>
        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={() => {
            setAnchorEl(null);
            setDropdownMenuType(null);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
              },
            },
          }}
        >
          {!!DropdownMenu[dropdownMenuType] &&
            Object.entries(DropdownMenu[dropdownMenuType])?.map(
              ([key, value]) => (
                <MenuItem key={key}>
                  <ListItemIcon>
                    {key === "createPublishNow" ? (
                      <CloudUploadRoundedIcon />
                    ) : (
                      <CalendarTodayRoundedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText>{value}</ListItemText>
                </MenuItem>
              )
            )}
        </Menu>
      </>
    </ThemeProvider>
  );
};
