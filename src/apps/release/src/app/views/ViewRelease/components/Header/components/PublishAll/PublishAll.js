import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
import { Box } from "@mui/material";
import BackupIcon from "@mui/icons-material/Backup";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { Notice } from "shell/components/legacy/Notice";
import {
  Modal,
  ModalContent,
  ModalFooter,
} from "shell/components/legacy/Modal";

import { publishAll } from "shell/store/releases";
import { usePermission } from "shell/hooks/use-permissions";

export const PublishAll = memo(function PublishAll() {
  const dispatch = useDispatch();
  const params = useParams();
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const canPublish = usePermission("PUBLISH");

  const onPublishAll = () => {
    setLoading(true);
    dispatch(publishAll(params.zuid)).finally(() => {
      setLoading(false);
      setOpen(false);
    });
  };

  return (
    <Box
      sx={(theme) => ({
        "& article": {
          top: 0,
          left: 0,
          boxShadow: `2px 2px 4px ${theme.palette.grey[800]}`,
          minWidth: 420,
          "& > footer": {
            display: "flex",
            justifyContent: "space-between",
          },
        },
      })}
    >
      <Button
        variant="contained"
        color="success"
        data-cy="releasePublishAll"
        title={t("release.publishAll")}
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
        startIcon={<BackupIcon />}
      >
        {t("release.publishAll")}
      </Button>

      <Modal type="local" open={open} onClose={() => setOpen(false)}>
        <ModalContent>
          <Notice>{t("release.publishAllNoticeBody")}</Notice>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="contained"
            data-cy="releasePublishAllCancel"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            {t("shell.cancelEsc")}
          </Button>
          <Button
            variant="contained"
            color="success"
            data-cy="releasePublishAllConfirm"
            disabled={loading}
            onClick={onPublishAll}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <CheckCircleIcon />
            }
          >
            {loading ? t("release.publishing") : t("release.publishAll")}
          </Button>
        </ModalFooter>
      </Modal>
    </Box>
  );
});
