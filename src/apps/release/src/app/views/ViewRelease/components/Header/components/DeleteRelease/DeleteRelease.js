import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Notice } from "shell/components/legacy/Notice";
import {
  Modal,
  ModalContent,
  ModalFooter,
} from "shell/components/legacy/Modal";

import { deleteRelease } from "shell/store/releases";
import { notify } from "shell/store/notifications";
import { isRequestFailed, notifyFailure } from "utility/request";
import { usePermission } from "shell/hooks/use-permissions";

export const DeleteRelease = memo(function DeleteRelease({ isContentSubpage }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const params = useParams();
  const history = useHistory();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const canPublish = usePermission("PUBLISH");

  const release = useSelector((state) =>
    state.releases.data.find((r) => r.ZUID === params.zuid)
  );

  const onDeleteRelease = () => {
    setLoading(true);
    dispatch(deleteRelease(params.zuid)).then((res) => {
      if (isRequestFailed(res)) {
        // Stay on the page so the user can retry
        setLoading(false);
        setOpen(false);
        notifyFailure(
          dispatch,
          res,
          t("release.failedDeletingRelease", { name: release?.name })
        );
        return;
      }
      dispatch(
        notify({
          kind: "success",
          message: t("release.deletedRelease", { name: release?.name }),
        })
      );
      history.push(isContentSubpage ? "/content/releases" : "/release");
    });
  };

  return (
    <Box
      sx={(theme) => ({
        "& article": {
          top: 0,
          right: 0,
          boxShadow: `2px 2px 4px ${theme.palette.grey[800]}`,
          "& > footer": {
            display: "flex",
            justifyContent: "space-between",
          },
        },
      })}
    >
      <Button
        variant="contained"
        color="error"
        data-cy="releaseDelete"
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
        startIcon={<DeleteIcon />}
      >
        {t("common.delete")}
      </Button>

      <Modal type="local" open={open} onClose={() => setOpen(false)}>
        <ModalContent>
          <Notice>{t("release.deleteWarning")}</Notice>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="contained"
            data-cy="releaseDeleteCancel"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            {t("shell.cancelEsc")}
          </Button>
          <Button
            variant="contained"
            color="error"
            data-cy="releaseDeleteConfirm"
            disabled={loading}
            onClick={onDeleteRelease}
            startIcon={<DeleteIcon />}
          >
            {t("release.deleteRelease")}
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
});
