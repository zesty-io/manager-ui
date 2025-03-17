import { memo, useState } from "react";

import * as React from "react";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton } from "@mui/material";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import { Notice } from "@zesty-io/core/Notice";
import { DifferActions } from "./DifferActions";
import { EditorActions } from "./EditorActions";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";
import { DeleteDialog } from "./DeleteDialog";
import CheckIcon from "@mui/icons-material/Check";

const TopBar = memo(function TopBar(props) {
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        px={4}
        pt={4}
        pb={1.75}
        maxHeight="84px"
        minHeight="84px"
        sx={{
          backgroundColor: "grey.900",
          color: "grey.300",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          flexDirection="row"
          justifyContent="flex-start"
          columnGap={1}
          flexGrow={1}
          pr={3}
        >
          <Typography variant="h6" color="grey.300">
            {props.fileName}
          </Typography>
        </Box>

        {!props.synced && (
          <Notice>
            There is a new remote version ahead of your local changes
          </Notice>
        )}
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {props?.isDiffer ? (
            <DifferActions
              dispatch={props.dispatch}
              fileZUID={props.fileZUID}
              fileType={props.fileType}
              publishedVersion={props.publishedVersion}
              status={props.status}
              synced={props.synced}
              setVersionCodeLeft={props.setVersionCodeLeft}
              setVersionCodeRight={props.setVersionCodeRight}
              setLoading={props.setLoading}
            />
          ) : (
            <>
              <Box px={2} color="grey.400">
                <MoreOptions
                  contentModelZUID={props.contentModelZUID}
                  fileType={props.fileType}
                  fileZUID={props.fileZUID}
                  publishedVersion={props.publishedVersion}
                  version={props.version}
                  openDeleteDialog={() => setDeleteDialogIsOpen(true)}
                />
              </Box>

              <EditorActions
                dispatch={props.dispatch}
                fileZUID={props.fileZUID}
                fileType={props.fileType}
                version={props.version}
                synced={props.synced}
                status={props.status}
                isLive={props.isLive}
                code={props.code}
                contentModelZUID={props.contentModelZUID}
              />
            </>
          )}
        </Box>
      </Box>
      <DeleteDialog
        open={deleteDialogIsOpen}
        onClose={() => setDeleteDialogIsOpen(false)}
        fileZUID={props.fileZUID}
        fileName={props.fileName}
        status={props.status}
      />
    </>
  );
});

const MoreOptions = (props) => {
  const history = useHistory();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (data) => {
    return () => {
      navigator?.clipboard
        ?.writeText(data)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 700);
        })
        .catch((err) => {
          console.error("Error");
          console.error(err);
        });
    };
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isDiffer = location.pathname.includes("/diff/");

  return (
    <>
      <IconButton color="inherit" id="more-options" onClick={handleClick}>
        <MoreHorizIcon />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: -8,
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 230,
              borderRadius: "8px",
            },
          },
        }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              handleClose();
              props.openDeleteDialog();
            }}
          >
            <ListItemIcon color="inherit">
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText color="text.primary">Delete File</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleCopyClick(props.fileZUID)}>
            <ListItemIcon color="inherit">
              {isCopied ? (
                <CheckIcon color="success" />
              ) : (
                <WidgetsRoundedIcon />
              )}
            </ListItemIcon>
            <ListItemText>Copy ZUID</ListItemText>
          </MenuItem>
          {props.contentModelZUID && (
            <>
              <MenuItem
                onClick={() =>
                  history.push(`/content/${props.contentModelZUID}`)
                }
              >
                <ListItemIcon color="inherit">
                  <EditRoundedIcon />
                </ListItemIcon>
                <ListItemText>Edit Related Content</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() =>
                  history.push(`/schema/${props.contentModelZUID}`)
                }
              >
                <ListItemIcon color="inherit">
                  <StorageRoundedIcon />
                </ListItemIcon>
                <ListItemText>Edit Related Model</ListItemText>
              </MenuItem>
            </>
          )}

          {!isDiffer && (
            <MenuItem
              onClick={() => {
                handleClose();
                history.push(
                  `/code/file/${props.fileType}/${props.fileZUID}/diff/local,${
                    props.publishedVersion
                      ? props.publishedVersion
                      : props.version
                  }`
                );
              }}
            >
              <ListItemIcon color="inherit">
                <RestoreOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Diff Version</ListItemText>
            </MenuItem>
          )}
          {props.contentModelZUID && (
            <MenuItem
              onClick={() =>
                window.open(
                  `${CONFIG.URL_PREVIEW_FULL}/-/instant/${props?.contentModelZUID}.json`,
                  "_blank"
                )
              }
            >
              <ListItemIcon color="inherit">
                <ElectricBoltOutlinedIcon />
              </ListItemIcon>
              <ListItemText>Preview JSON</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </>
  );
};

export { TopBar };
