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

type ModalProps = {
  open?: boolean;
  type?: "local" | "global";
  onClose?: (evt: React.MouseEvent<HTMLButtonElement> | KeyboardEvent) => void;
  className?: string;
  children?: React.ReactNode;
};

export const Modal = React.memo((props: ModalProps) => {
  const [open, setOpen] = useState(Boolean(props.open));

  const styleLocal = props.type === "local" ? styles.Local : null;
  const styleGlobal = props.type === "global" ? styles.Global : null;
  const styleOpen = open ? styles.Open : null;

  const onClose = (
    evt: React.MouseEvent<HTMLButtonElement> | KeyboardEvent
  ) => {
    setOpen(false);
    if (props.onClose) {
      props.onClose(evt);
    }
  };

  const onEsc = (evt: KeyboardEvent) => {
    if (evt.key === "Escape" || evt.keyCode === 27) {
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

  const modalRef = useRef<HTMLElement>(null);
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
        {/* @ts-expect-error untyped */}
        <Button className={styles.Close} onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
        {props.children}
      </article>
    </div>
  );
});

type ModalHeaderProps = {
  className?: string;
  children?: React.ReactNode;
};

export const ModalHeader = React.memo((props: ModalHeaderProps) => {
  return (
    <header className={cx(styles.ModalHeader, props.className)}>
      {props.children}
    </header>
  );
});

type ModalContentProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

export const ModalContent = React.memo((props: ModalContentProps) => {
  const { className, children, ...rest } = props;
  return (
    <main {...rest} className={cx(styles.ModalContent, className)}>
      {children}
    </main>
  );
});

type ModalFooterProps = {
  className?: string;
  children?: React.ReactNode;
};

export const ModalFooter = React.memo((props: ModalFooterProps) => {
  return (
    <footer className={cx(styles.ModalFooter, props.className)}>
      {props.children}
    </footer>
  );
});
