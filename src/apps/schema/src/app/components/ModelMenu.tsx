import React, { useState, FC } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
} from "@mui/material";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { theme } from "@zesty-io/material";

import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { DuplicateModelDialogue } from "./DuplicateModelDialogue";
import { DeleteModelDialogue } from "./DeleteModelDialogue";
import { RenameModelDialogue } from "./RenameModelDialogue";

interface Props {
  anchorEl: any;
  onClose: () => void;
  modelZUID: string;
}
export const ModelMenu: FC<Props> = ({ anchorEl, onClose, modelZUID }) => {
  const [showDialogue, setShowDialogue] = useState<
    "rename" | "duplicate" | "delete" | null
  >(null);
  const [isCopied, setIsCopied] = useState(false);
  const { data: models } = useGetContentModelsQuery();
  const model = models?.find((model) => model.ZUID === modelZUID);

  const handleCopyZUID = (data: string) => {
    navigator?.clipboard
      ?.writeText(data)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose}>
        <MenuItem
          onClick={() => {
            setShowDialogue("rename");
            onClose();
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Model</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDialogue("duplicate");
            onClose();
          }}
        >
          <ListItemIcon>
            <ContentCopyRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate Model</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopyZUID(model.ZUID)}>
          <ListItemIcon>
            {isCopied ? (
              <CheckRoundedIcon fontSize="small" />
            ) : (
              <WidgetsRoundedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>Copy ZUID</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDialogue("delete");
            onClose();
          }}
        >
          <ListItemIcon>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Model</ListItemText>
        </MenuItem>
      </Menu>

      {showDialogue === "rename" && (
        <RenameModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
      {showDialogue === "duplicate" && (
        <DuplicateModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
      {showDialogue === "delete" && (
        <DeleteModelDialogue
          model={model}
          onClose={() => setShowDialogue(null)}
        />
      )}
    </ThemeProvider>
  );
};
