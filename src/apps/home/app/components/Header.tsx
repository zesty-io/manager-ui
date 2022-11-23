import { useState } from "react";
import {
  Box,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Backdrop,
} from "@mui/material";
import { useSelector } from "react-redux";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { Database } from "@zesty-io/material";
import { useHistory } from "react-router";
import { CreateContentItemDialog } from "./CreateContentItemDialog";

export const Header = () => {
  const userFirstName = useSelector((state: any) => state.user.firstName);
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
      onClick: () => history.push("/schema/new"),
    },
    {
      icon: <CodeRoundedIcon />,
      name: "Create Code File",
      onClick: () => history.push("/code?triggerCreate=true"),
    },
  ];
  return (
    <Box
      sx={{
        height: "160px",
        color: "common.white",
        px: 3,
        py: 2,
        background: (theme) =>
          // @ts-expect-error - missing module augmentations
          `linear-gradient(91.57deg, ${theme.palette.deepOrange?.[500]} 0%, ${theme.palette.deepOrange?.[600]} 100%)`,
      }}
    >
      <Typography variant="h4" fontWeight={600}>
        Good Morning, {userFirstName}
      </Typography>
      <Typography variant="subtitle1" marginTop={0.5}>
        Here is your instance summary of the last 30 days
      </Typography>
      <Backdrop
        open={open}
        sx={{ zIndex: (theme) => theme.zIndex.speedDial - 1 }}
      />
      <SpeedDial
        ariaLabel="Instance speed dial"
        sx={{ position: "absolute", top: 16, right: 24 }}
        icon={<SpeedDialIcon />}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
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
    </Box>
  );
};
