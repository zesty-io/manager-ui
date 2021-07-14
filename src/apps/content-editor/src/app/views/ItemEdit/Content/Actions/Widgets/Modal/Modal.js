import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";

import styles from "./Modal.less";
export const Modal = ({ handleClose, children }) => {
  return (
    <div className={styles.ModalContainer}>
      <div className={styles.Modal}>
        <FontAwesomeIcon icon={faWindowClose} onClick={handleClose} />
        {children}
      </div>
    </div>
  );
};
