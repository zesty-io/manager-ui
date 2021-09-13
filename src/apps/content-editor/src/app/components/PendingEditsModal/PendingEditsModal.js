import { memo, useState, useEffect } from "react";
import { Prompt } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTrash,
  faSpinner,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import {
  Modal,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@zesty-io/core/Modal";

import styles from "./PendingEditsModal.less";
export default memo(function PendingEditsModal(props) {
  // FIXME: non memoized onSave & onDiscard props are causing rerenders

  const [loading, setLoading] = useState(props.loading || false);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(() => () => {});

  // Expose globals so external components can invoke
  // NOTE: Should this be a portal?
  useEffect(() => {
    window.openNavigationModal = (callback) => {
      setOpen(true);
      setAnswer(() => callback);
    };

    return () => {
      window.openNavigationModal = null;
    };
  }, []);

  const handler = (evt) => {
    switch (evt.currentTarget.attributes["type"].value) {
      case "save":
        setLoading(true);
        props.onSave().then(() => {
          setLoading(false);
          setOpen(false);
          answer(true);
        });
      case "warn":
        setLoading(true);
        props.onDiscard().then(() => {
          setLoading(false);
          setOpen(false);
          answer(true);
        });
      case "cancel":
        setOpen(false);
        answer(false);
    }
  };

  return (
    <>
      <Prompt when={Boolean(props.show)} message={"confirm"} />
      <Modal
        className={styles.PendingEditsModal}
        onClose={() => {
          answer(false);
          setOpen(false);
        }}
        open={open}
      >
        <ModalHeader>
          <h1>{props.title}</h1>
        </ModalHeader>
        <ModalContent>
          <p>{props.message}</p>
        </ModalContent>
        <ModalFooter>
          <ButtonGroup className={styles.Actions}>
            <Button disabled={loading} type="save" onClick={handler}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              Save
            </Button>
            <Button disabled={loading} type="warn" onClick={handler}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faTrash} />
              )}
              Discard
            </Button>
            <Button disabled={loading} type="cancel" onClick={handler}>
              <FontAwesomeIcon icon={faBan} />
              Cancel (ESC)
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </>
  );
});
