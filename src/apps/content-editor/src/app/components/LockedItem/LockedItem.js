import { useState } from "react";
import moment from "moment-timezone";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faStepBackward,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Url } from "@zesty-io/core/Url";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";

import styles from "./LockedItem.less";

export const LockedItem = ({
  timestamp,
  userFirstName,
  userLastName,
  userEmail,
  itemName,
  handleUnlock,
  goBack,
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className={styles.ItemLocked}>
      <Modal
        className={styles.Modal}
        type="global"
        open={open}
        onClose={() => setOpen(false)}
      >
        <FontAwesomeIcon className={styles.backgroundIcon} icon={faLock} />
        <header className={cx(styles.headline, styles.Header)}>
          Item Locked
        </header>

        <ModalContent className={cx(styles.ModalContent, styles.subheadline)}>
          <p>
            The item <strong className={styles.ItemName}>{itemName}</strong> is
            being edited by&nbsp;
            {userFirstName} {userLastName} since&nbsp;
            {moment.unix(timestamp).format("MMMM Do YYYY, [at] h:mm a")}
          </p>

          <p>
            You can contact {userFirstName} via&nbsp;
            <Url title="Email" href={`mailto:${userEmail}`}>
              {userEmail}
            </Url>
          </p>

          <p>
            To ignore this warning and possibly overwrite {userFirstName}'s
            changes you may unlock this content
          </p>
        </ModalContent>

        <ModalFooter className={styles.Footer}>
          <span className={styles.AlignRight}>
            <ButtonGroup>
              <Button
                className={styles.ButtonBack}
                kind="cancel"
                onClick={goBack}
              >
                <FontAwesomeIcon icon={faStepBackward} /> Go Back
              </Button>
              <Button kind="save" onClick={handleUnlock}>
                <FontAwesomeIcon icon={faUnlock} /> Unlock
              </Button>
            </ButtonGroup>
          </span>
        </ModalFooter>
      </Modal>
    </div>
  );
};
