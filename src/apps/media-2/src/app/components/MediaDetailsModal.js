import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faExclamationCircle,
  faFilePdf,
  faLink
} from "@fortawesome/free-solid-svg-icons";
import cx from "classnames";
import { Url } from "@zesty-io/core/Url";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./MediaDetailsModal.less";

export function MediaDetailsModal(props) {
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
            <dt> Date: </dt>
            <dd>{props.file.updated_at}</dd>
            <dt> Dimensions: </dt>
            <dd> 2048 x 1536 pixels</dd>
            <dt> File Size: </dt>
            <dd>197.16 K</dd>
          </dl>
        </div>
        <div className={styles.ImageContainer}>
          <div className={styles.Checkered}>
            <Url
              target="_blank"
              title="View Original Image"
              href={props.file.url}
            >
              <img
                className={styles.ModalImage}
                src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${props.file.id}/getimage/?w=350&type=fit`}
                alt={props.file.title}
              />
              <FontAwesomeIcon className={styles.PDF} icon={faFilePdf} />
            </Url>
          </div>
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
          <span>Save (CTR + S)</span>
        </Button>
        <Button kind="warn">
          <FontAwesomeIcon icon={faExclamationCircle} />
          <span>Delete</span>
        </Button>
      </ModalFooter>
    </Modal>
  );
}
