import { useState } from "react";
import { LoadingButton } from "@mui/lab";
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

import { useMetaKey } from "../../../../../../shell/hooks/useMetaKey";
import { ContentModel } from "../../../../../../shell/services/types";
import { ContentBreadcrumbs } from "../../components/ContentBreadcrumbs";
import { ActionAfterSave } from "./ItemCreate";

type DropdownMenuType = "default" | "addNew";
const DropdownMenu: Record<DropdownMenuType, Record<string, string>> = {
  default: {
    publishNow: "Create & Publish Now",
    schedulePublish: "Create & Schedule Publish",
  },
  addNew: {
    publishAddNew: "Create, Publish & Add New",
    schedulePublishAddNew: "Create, Schedule Publish & Add New",
  },
};

interface Props {
  model: ContentModel;
  onSave: (action: ActionAfterSave) => void;
  isLoading: boolean;
  isDirty: boolean;
}
export const Header = ({ model, onSave, isLoading, isDirty }: Props) => {
  const [dropdownMenuType, setDropdownMenuType] =
    useState<DropdownMenuType | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

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
            <ContentBreadcrumbs />
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
              disabled={!isDirty || isLoading}
            >
              <LoadingButton
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  onSave("addNew");
                }}
                loading={isLoading}
                variant="outlined"
              >
                Create & Add New
              </LoadingButton>
              <Button
                size="xsmall"
                onClick={(evt) => {
                  setAnchorEl(evt.currentTarget);
                  setDropdownMenuType("addNew");
                }}
                sx={{
                  px: 1,
                  "&.MuiButtonGroup-grouped": {
                    minWidth: 34,
                  },
                }}
              >
                <ArrowDropDownRoundedIcon sx={{ fontSize: 18 }} />
              </Button>
            </ButtonGroup>
            <ButtonGroup
              variant="contained"
              color="primary"
              size="small"
              disabled={!isDirty || isLoading}
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
              <LoadingButton
                startIcon={<SaveRoundedIcon />}
                onClick={() => {
                  onSave("");
                }}
                loading={isLoading}
                variant="contained"
                data-cy="CreateItemSaveButton"
              >
                Create
              </LoadingButton>
              <Button
                size="xsmall"
                onClick={(evt) => {
                  setAnchorEl(evt.currentTarget);
                  setDropdownMenuType("default");
                }}
                sx={{
                  px: 1,
                  "&.MuiButtonGroup-grouped": {
                    minWidth: 34,
                  },
                }}
              >
                <ArrowDropDownRoundedIcon sx={{ fontSize: 18 }} />
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
                <MenuItem
                  key={key}
                  onClick={() => {
                    onSave(key as ActionAfterSave);
                    setAnchorEl(null);
                    setDropdownMenuType(null);
                  }}
                  sx={{
                    height: 40,
                    px: 2,
                    py: 1,
                  }}
                >
                  <ListItemIcon>
                    {["publishNow", "publishAddNew"].includes(key) ? (
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
