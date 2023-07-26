import { useState } from "react";
import { alpha } from "@mui/material/styles";
import {
  Box,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { useSelector } from "react-redux";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckIcon from "@mui/icons-material/Check";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { Database } from "@zesty-io/material";
import { useHistory } from "react-router";
import { CreateContentItemDialog } from "../../../../shell/components/CreateContentItemDialog";

interface Props {
  dateRange: number;
  onDateRangeChange: (dateRange: number) => void;
  hideSubtitle?: boolean;
}

const dateRanges = [7, 14, 30, 90];

export const Header = ({
  hideSubtitle,
  dateRange,
  onDateRangeChange,
}: Props) => {
  const userFirstName = useSelector((state: any) => state.user.firstName);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const [open, setOpen] = useState(false);
  const [openCreateContentDialog, setOpenCreateContentDialog] = useState(false);
  const history = useHistory();
  const actions = [
    {
      icon: <EditRoundedIcon />,
      name: "Create Content",
      onClick: () => setOpenCreateContentDialog(true),
    },
    {
      icon: <ImageRoundedIcon />,
      name: "Upload Media",
      onClick: () => history.push("/media?triggerUpload=true"),
    },
    {
      icon: <Database />,
      name: "Create Model",
      onClick: () => history.push("/schema?triggerCreate=true"),
    },
    {
      icon: <CodeRoundedIcon />,
      name: "Create Code File",
      onClick: () => history.push("/code?triggerCreate=true"),
    },
  ];
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Box
        sx={{
          height: "160px",
          color: "common.white",
          px: 3,
          py: 2,
          background: (theme) =>
            `linear-gradient(91.57deg, ${theme.palette.deepOrange?.[500]} 0%, ${theme.palette.deepOrange?.[600]} 100%)`,
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Good Morning, {userFirstName}
        </Typography>
        <Typography
          variant="subtitle1"
          marginTop={0.5}
          sx={{ visibility: hideSubtitle && "hidden" }}
        >
          Here is your instance summary of the{" "}
          <Box
            component="span"
            onClick={handleClick}
            sx={{
              gap: 0.25,
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            last {dateRange} days <KeyboardArrowDownRoundedIcon />
          </Box>
        </Typography>
      </Box>
      <Menu open={openMenu} onClose={handleClose} anchorEl={anchorEl}>
        {dateRanges.map((dateRangeItem) => (
          <MenuItem
            onClick={() => {
              onDateRangeChange(dateRangeItem);
              handleClose();
            }}
            sx={{
              ...(dateRangeItem === dateRange && {
                backgroundColor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.action.hoverOpacity
                  ),
              }),
            }}
          >
            <ListItemIcon
              sx={{ visibility: dateRangeItem !== dateRange && "hidden" }}
            >
              <CheckIcon color="primary" />
            </ListItemIcon>
            Last {dateRangeItem} days
          </MenuItem>
        ))}
      </Menu>
      <Backdrop
        onClick={() => setOpen(false)}
        open={open}
        sx={{ zIndex: (theme) => theme.zIndex.speedDial - 1 }}
      />
      <SpeedDial
        ariaLabel="Instance speed dial"
        sx={{ position: "absolute", top: 16, right: 24 }}
        icon={<SpeedDialIcon />}
        open={open}
        onClick={() => setOpen(!open)}
        direction="down"
        FabProps={{
          size: "small",
          sx: {
            backgroundColor: "#fff !important",
            boxShadow: "none",
            color: "primary.main",
          },
        }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            FabProps={{
              sx: {
                backgroundColor: "primary.main",
                color: "common.white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            }}
            onClick={action.onClick}
            tooltipOpen
          />
        ))}
      </SpeedDial>
      {openCreateContentDialog ? (
        <CreateContentItemDialog
          open={openCreateContentDialog}
          onClose={() => setOpenCreateContentDialog(false)}
        />
      ) : null}
    </>
  );
};
