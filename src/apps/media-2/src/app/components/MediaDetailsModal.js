import React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faExclamationCircle,
  faLink
} from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";
import { MediaImage } from "./MediaImage";

import styles from "./MediaDetailsModal.less";
import shared from "./MediaShared.less";

export const MediaDetailsModal = React.memo(function MediaDetailsModal(props) {
  return (
    <Modal
      className={styles.Modal}
      type="global"
      // set to true for testing
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent className={styles.ModalContent}>
        <div>
          <FieldLabel
            className={styles.ModalLabels}
            name="copylink"
            label={
              <label>
                <Infotip title="Copy URL" />
                &nbsp;Copy
              </label>
            }
          />
          <label className={styles.CopyLabel}>
            <Button kind="secondary">
              <FontAwesomeIcon icon={faCopy} />
              <span>Copy</span>
            </Button>
            <input id="copy" type="text" defaultValue="VALUE" />
          </label>
          <FieldTypeText
            className={styles.ModalLabels}
            name="title"
            value={props.file.title}
            label={
              <label>
                <Infotip title="Edit Image Title" />
                &nbsp;Title
              </label>
            }
            placeholder={"Image Title"}
          />
          <FieldTypeText
            className={styles.ModalLabels}
            name="filename"
            value={props.file.filename}
            label={
              <label>
                <Infotip title="Edit Filename " />
                &nbsp;Filename
              </label>
            }
            placeholder={"Image Filename"}
          />
          <FieldTypeText
            className={styles.ModalLabels}
            name="alt"
            label={
              <label>
                <Infotip title="Edit Alt Attribute " />
                &nbsp;Alt Attribute
              </label>
            }
            placeholder={"Alt Attribute"}
          />

          <dl className={styles.DescriptionList}>
            <dt>ZUID:</dt>
            <dd>{props.file.id}</dd>
            {props.file.updated_at && (
              <>
                <dt> Date: </dt>
                <dd>{props.file.updated_at}</dd>
              </>
            )}
          </dl>
        </div>
        <div className={styles.ImageContainer}>
          <figure className={cx(shared.Checkered, shared.Cmodal)}>
            <Url
              target="_blank"
              title="View Original Image"
              href={props.file.url}
            >
              <MediaImage file={props.file} params={"?w=350&type=fit"} />
            </Url>
          </figure>
          <Url target="_blank" title="Original Image" href={props.file.url}>
            <Button className={styles.OriginalButton} kind="kind">
              <FontAwesomeIcon icon={faLink} />
              <span>View Original Image</span>
            </Button>
          </Url>
        </div>
      </ModalContent>
      <ModalFooter className={styles.ModalFooter}>
        <Button kind="save">
          <span>Save (CTRL + S)</span>
        </Button>
        <Button kind="warn" onClick={props.showDeleteFileModal}>
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
});
