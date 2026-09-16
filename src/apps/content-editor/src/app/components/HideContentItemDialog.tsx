import { FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
  Stack,
  SvgIcon,
} from "@mui/material";
import { VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";

import { ContentNavItem } from "../../../../../shell/services/types";
import { TreeItem } from "../../../../../shell/components/NavTree";

interface Props {
  isHide: boolean;
  item: TreeItem;
  onClose: () => void;
  onToggleItemHideStatus: (item: TreeItem) => void;
}

export const HideContentItemDialog: FC<Readonly<Props>> = ({
  isHide,
  item,
  onClose,
  onToggleItemHideStatus,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth={"xs"}>
      <DialogContent sx={{ mt: 2.5 }}>
        <Stack>
          <SvgIcon
            component={isHide ? VisibilityOffRounded : VisibilityRounded}
            color="primary"
            sx={{
              padding: "8px",
              borderRadius: "20px",
              backgroundColor: "deepOrange.50",
              display: "block",
              mb: 1.5,
              width: "40px",
              height: "40px",
            }}
          />

          <Typography variant="h5" fontWeight={600} mb={1}>
            {isHide
              ? t("content.hideDialogHideTitle", { label: item.label })
              : t("content.hideDialogUnhideTitle", { label: item.label })}
          </Typography>
          {isHide ? (
            <>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                {t("content.hideDialogHideBody1", { label: item.label })}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {t("content.hideDialogHideBody2")}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("content.hideDialogUnhideBody", { label: item.label })}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onClose();
            onToggleItemHideStatus(item);
          }}
        >
          {isHide
            ? t("content.hideDialogHideButton", { label: item.label })
            : t("content.hideDialogUnhideButton", { label: item.label })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
