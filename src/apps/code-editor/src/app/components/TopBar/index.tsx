import { memo, useState } from "react";
import * as React from "react";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { IconButton, Tooltip } from "@mui/material";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Typography, Link } from "@mui/material";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import { Notice } from "shell/components/legacy/Notice";
import { DifferActions } from "./DifferActions";
import { EditorActions } from "./EditorActions";
import ElectricBoltOutlinedIcon from "@mui/icons-material/ElectricBoltOutlined";
import { DeleteDialog } from "./DeleteDialog";
import CheckIcon from "@mui/icons-material/Check";
import { parseInt } from "lodash";
import VerticalSplitRoundedIcon from "@mui/icons-material/VerticalSplitRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { Database } from "@zesty-io/material";

export type FileVersionTypes = {
  code: string;
  createdAt: string;
  updatedAt?: string;
  version: number | string;
  fileID?: number;
  status: string;
};
interface TopBarProps {
  fileName: string;
  synced: boolean;
  isDiffer?: boolean;
  fileZUID: string;
  fileType: string;
  publishedVersion?: string;
  status: string;
  version: string;
  isLive: boolean;
  code: string;
  contentModelZUID?: string;
  isDirty: boolean;
  updatedAt?: string;
  updatedBy?: string;
  publishedAt?: string;
  publishedBy?: string;
  isLoading?: boolean;
  setVersionCodeLeft?: (code: string) => void;
  setVersionCodeRight?: (code: string) => void;
  setLoading?: (loading: boolean) => void;
  icon?: any;
}
const TopBar = memo(function TopBar(props: TopBarProps) {
  const history = useHistory();
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        px={3}
        pt={2}
        pb={2}
        maxHeight="64px"
        minHeight="64px"
        borderBottom="1px solid"
        borderColor="grey.800"
        sx={{
          bgcolor: "background.editor",
          color: "grey.300",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          flexDirection="row"
          justifyContent="flex-start"
          columnGap={1}
          overflow="hidden"
          minWidth="150px"
          flexGrow={1}
          pr={3}
          whiteSpace="nowrap"
        >
          <Box
            width="18px"
            height="18px"
            position="relative"
            sx={{
              "& svg": {
                position: "absolute",
                left: 0,
                top: 0,
                fontSize: "18px",
                color: !!props.contentModelZUID ? "info.main" : "grey.400",
              },
            }}
          >
            {!!props.contentModelZUID ? (
              <Link
                underline="none"
                color="secondary"
                //@ts-expect-error
                href={`${CONFIG.URL_PREVIEW_FULL}/-/instant/${props.contentModelZUID}.json`}
                target="_blank"
                title="Preview JSON"
                sx={{ m: 0, pr: 2, pl: 3.25, py: 0 }}
              >
                <FlashOnRoundedIcon />
              </Link>
            ) : (
              <Box component={props.icon} />
            )}
          </Box>
          <Typography
            variant="h6"
            color="grey.300"
            overflow="hidden"
            textOverflow="ellipsis"
            noWrap
            fontWeight={600}
          >
            {`/${props.fileName?.trim()?.replace(/^\/+/, "")}`}
          </Typography>
          <Typography
            variant="h6"
            color="grey.400"
            fontWeight={600}
          >{`(v${props?.version})`}</Typography>
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
              fileZUID={props.fileZUID}
              fileType={props.fileType}
              publishedVersion={props.publishedVersion}
              status={props.status}
              synced={props.synced}
              setVersionCodeLeft={props.setVersionCodeLeft}
              setVersionCodeRight={props.setVersionCodeRight}
              setLoading={props.setLoading}
              isLoading={props.isLoading}
              code={props.code}
              version={props.version}
            />
          ) : (
            <>
              <Box
                px={1}
                color="grey.400"
                display="flex"
                alignItems="center"
                columnGap={0.5}
              >
                <MoreOptions
                  contentModelZUID={props.contentModelZUID}
                  fileType={props.fileType}
                  fileZUID={props.fileZUID}
                  publishedVersion={props.publishedVersion}
                  version={props.version}
                  openDeleteDialog={() => setDeleteDialogIsOpen(true)}
                />
                {props.contentModelZUID && (
                  <>
                    <Tooltip
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Edit Related Content"
                      placement="bottom"
                    >
                      <IconButton
                        size="small"
                        sx={{ color: "grey.400" }}
                        onClick={() =>
                          history.push(`/content/${props.contentModelZUID}`)
                        }
                      >
                        <VerticalSplitRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      enterDelay={500}
                      enterNextDelay={500}
                      title="Edit Related Model"
                      placement="bottom"
                    >
                      <IconButton
                        size="small"
                        sx={{ color: "grey.400" }}
                        onClick={() =>
                          history.push(`/schema/${props.contentModelZUID}`)
                        }
                      >
                        <Database fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                {!props?.isDiffer && (
                  <Tooltip
                    enterDelay={500}
                    enterNextDelay={500}
                    title="Diff Versions"
                    placement="bottom"
                  >
                    <IconButton
                      size="small"
                      sx={{ color: "grey.400" }}
                      onClick={() => {
                        history.push(
                          `/code/file/${props.fileType}/${
                            props.fileZUID
                          }/diff/local,${
                            props.publishedVersion
                              ? props.publishedVersion
                              : props.version
                          }`
                        );
                      }}
                    >
                      <RestoreOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>

              <EditorActions
                fileZUID={props?.fileZUID}
                fileType={props?.fileType}
                version={parseInt(props?.version)}
                synced={props?.synced}
                status={props?.status}
                isLive={props?.isLive}
                isDirty={props?.isDirty}
                code={props.code}
                contentModelZUID={props?.contentModelZUID}
                updatedAt={props?.updatedAt}
                updatedBy={props?.updatedBy}
                publishedAt={props?.publishedAt}
                publishedBy={props?.publishedBy}
                publishedVersion={
                  typeof props?.publishedVersion == "string"
                    ? parseInt(props?.publishedVersion)
                    : props?.publishedVersion
                }
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
interface MoreOptionsProps {
  contentModelZUID?: string;
  fileType: string;
  fileZUID: string;
  publishedVersion?: string;
  version: string;
  openDeleteDialog: () => void;
}

const MoreOptions = (props: MoreOptionsProps) => {
  const history = useHistory();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = (data: string) => {
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
          console.error(err);
        });
    };
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        size="small"
        sx={{ color: "grey.400" }}
        id="more-options"
        onClick={handleClick}
      >
        <MoreHorizIcon fontSize="small" />
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
              width: 200,
              borderRadius: 1,
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
            <MenuItem
              onClick={() =>
                window.open(
                  //@ts-expect-error
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
