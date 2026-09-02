import React, { useState, FC } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { useTranslation } from "react-i18next";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import WidgetsRoundedIcon from "@mui/icons-material/WidgetsRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

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
  const { t } = useTranslation();
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
    <>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={onClose}
        container={() => document.getElementById(modelZUID)!}
        data-cy="schema-more-menu"
      >
        <MenuItem
          onClick={() => {
            setShowDialogue("rename");
            onClose();
          }}
        >
          <ListItemIcon>
            <DriveFileRenameOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("schema.renameModel")}</ListItemText>
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
          <ListItemText>{t("schema.duplicateModel")}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleCopyZUID(model.ZUID)}>
          <ListItemIcon>
            {isCopied ? (
              <CheckRoundedIcon fontSize="small" />
            ) : (
              <WidgetsRoundedIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>{t("schema.copyModelZUID")}</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setShowDialogue("delete");
            onClose();
          }}
          data-cy="delete-model-menu-button"
        >
          <ListItemIcon>
            <DeleteRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("schema.deleteModel")}</ListItemText>
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
    </>
  );
};
