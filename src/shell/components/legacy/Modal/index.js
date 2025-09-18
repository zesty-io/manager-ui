import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  memo,
} from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import { Button } from "shell/components/legacy/Button";

import styles from "./Modal.less";
export const Modal = React.memo(function Modal(props) {
  const [open, setOpen] = useState(Boolean(props.open));

  const styleLocal = props.type === "local" ? styles.Local : null;
  const styleGlobal = props.type === "global" ? styles.Global : null;
  const styleOpen = open ? styles.Open : null;

  const onClose = (evt) => {
    setOpen(false);
    if (props.onClose) {
      props.onClose(evt);
    }
  };

  const onEsc = (evt) => {
    if (evt.key === "Escape" || evt.keyCode == 27) {
      onClose(evt);
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", onEsc);
    return () => {
      window.removeEventListener("keyup", onEsc);
    };
  }, []);

  // Allow consumer to update internal open state
  useEffect(() => setOpen(Boolean(props.open)), [props.open]);

  const modalRef = useRef(null);
  useLayoutEffect(() => {
    if (modalRef.current) {
      const modalPosition = modalRef.current.getBoundingClientRect();
      if (modalPosition.left < 0) {
        // Modals total width(including padding) + negative left offset - left & right padding - additional 8px for spacing
        let width = modalPosition.width + modalPosition.left - 64 - 8;
        modalRef.current.style.minWidth = `${width}px`;
      }
    }
  }, [open]);

  return (
    <div
      className={cx(styles.ModalAligner, styleLocal, styleGlobal, styleOpen)}
    >
      <article
        ref={modalRef}
        className={cx(styles.Modal, styleLocal, styleGlobal, props.className)}
      >
        <Button className={styles.Close} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
        {props.children}
      </article>
    </div>
  );
});

export const ModalHeader = React.memo(function ModalHeader(props) {
  return (
    <header className={cx(styles.ModalHeader, props.className)}>
      {props.children}
    </header>
  );
});

export const ModalContent = React.memo(function ModalContent(props) {
  return (
    <main {...props} className={cx(styles.ModalContent, props.className)}>
      {props.children}
    </main>
  );
});

export const ModalFooter = React.memo(function ModalFooter(props) {
  return (
    <footer className={cx(styles.ModalFooter, props.className)}>
      {props.children}
    </footer>
  );
});
