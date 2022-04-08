import { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";

import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import { publishAll } from "shell/store/releases";
import { usePermission } from "shell/hooks/use-permissions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faSpinner,
  faCloudUploadAlt,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./PublishAll.less";
export const PublishAll = memo(function PublishAll() {
  const dispatch = useDispatch();
  const params = useParams();

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
        title="Publish All"
        onClick={() => setOpen(true)}
        disabled={!canPublish || loading}
      >
        <FontAwesomeIcon icon={faCloudUploadAlt} />
        Publish All
      </Button>

      <Modal
        className={styles.PublishAllModal}
        type="local"
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalContent>
          <Notice>
            This will publish all members in this release. Purging all member
            URLs and related content.
          </Notice>
        </ModalContent>
        <ModalFooter className={styles.ModalFooter}>
          <Button type="save" disabled={loading} onClick={onPublishAll}>
            {loading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Publishing
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheckCircle} />
                &nbsp;Publish All
              </>
            )}
          </Button>
          <Button type="cancel" onClick={() => setOpen(false)}>
            <FontAwesomeIcon icon={faBan} />
            Cancel (ESC)
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
