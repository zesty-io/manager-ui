import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";

import Button from "@mui/material/Button";
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

import styles from "./PublishAll.less";
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
    <div>
      <Button
        variant="contained"
        color="success"
        title={t("release.publishAll")}
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
        startIcon={<BackupIcon />}
      >
        {t("release.publishAll")}
      </Button>

      <Modal
        className={styles.PublishAllModal}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          <Notice>{t("release.publishAllNoticeBody")}</Notice>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button
            variant="contained"
            onClick={() => setOpen(false)}
            startIcon={<DoDisturbAltIcon />}
          >
            {t("shell.cancelEsc")}
          </Button>
          <Button
            variant="contained"
            color="success"
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
    </div>
  );
});
