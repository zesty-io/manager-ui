import { memo, Fragment, useState } from "react";
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faCloudUploadAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { AppLink } from "@zesty-io/core/AppLink";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import { notify } from "shell/store/notifications";
import {
  publishFile,
  resolvePathPart,
  fetchFiles,
} from "../../../../../store/files";

import styles from "./PublishAll.less";
export default connect((state) => {
  return {
    files: state.files.filter((file) => file.isLive === false),
  };
})(
  memo(function PublishAll(props) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handlePublishAll = () => {
      setLoading(true);

      const requests = props.files.map((file) => {
        return props.dispatch(publishFile(file.ZUID, file.status));
      });

      Promise.all(requests)
        .then((responses) => {
          if (responses.find((res) => res.status !== 200)) {
            props.dispatch(
              notify({
                kind: "warn",
                message: "We were unable to publish one or more files",
              })
            );
          } else {
            props.dispatch(
              notify({
                kind: "success",
                message: "All files has been published",
              })
            );
            setOpen(false);
          }
        })
        .catch((err) => {
          props.dispatch(
            notify({
              kind: "warn",
              message: err.message,
            })
          );
        })
        .finally(() => {
          setLoading(false);

          props.dispatch(fetchFiles("views"));
          props.dispatch(fetchFiles("stylesheets"));
          props.dispatch(fetchFiles("scripts"));
        });
    };

    return (
      <Fragment>
        <Button
          className={styles.PublishAllBtn}
          onClick={() => setOpen(true)}
          title="Publish All Files"
        >
          <FontAwesomeIcon icon={faCloudUploadAlt} />
        </Button>
        <Modal
          className={styles.PublishAll}
          // type="local"
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalHeader>
            <Notice>
              This action will publish all files in {props.branch} to the
              production environment. Triggering a full instance cache purge.
            </Notice>
          </ModalHeader>

          <ModalContent className={styles.ModalContent}>
            <ul>
              {props.files.map((file) => (
                <li key={file.ZUID}>
                  Version {file.version}&nbsp;&mdash;&nbsp;
                  <AppLink
                    to={`/code/file/${resolvePathPart(file.type)}/${
                      file.ZUID
                    }/diff`}
                  >
                    {file.fileName}
                  </AppLink>
                </li>
              ))}
            </ul>
          </ModalContent>
          <ModalFooter>
            <ButtonGroup className={styles.ModalActions}>
              <Button kind="save" onClick={handlePublishAll} disabled={loading}>
                {loading ? (
                  <FontAwesomeIcon spin icon={faSpinner} />
                ) : (
                  <FontAwesomeIcon icon={faCheckCircle} />
                )}
                Publish All Files
              </Button>

              <Button kind="cancel" onClick={() => setOpen(false)}>
                <FontAwesomeIcon icon={faBan} />
                Cancel (ESC)
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  })
);
