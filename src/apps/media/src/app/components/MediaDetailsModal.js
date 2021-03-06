import { memo, useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faLink,
  faSave,
  faTrash,
  faBan,
} from "@fortawesome/free-solid-svg-icons";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Infotip } from "@zesty-io/core/Infotip";
import { Url } from "@zesty-io/core/Url";

import { MediaImage } from "./MediaImage";
import { editFile } from "shell/store/media";

import shared from "./MediaShared.less";
import styles from "./MediaDetailsModal.less";

export const MediaDetailsModal = memo(function MediaDetailsModal(props) {
  const dispatch = useDispatch();
  const platform = useSelector((state) => state.platform);
  const userRole = useSelector((state) => state.userRole);
  const urlField = useRef();
  const copyButton = useRef();

  // state for controlled fields
  const [title, setTitle] = useState(props.file.title);
  const [filename, setFilename] = useState(props.file.filename);

  function saveFile() {
    dispatch(editFile(props.file.id, { title, filename })).then(() => {
      props.onClose();
    });
  }

  function handleKeyboardShortcutSave(evt) {
    if (
      ((platform.isMac && evt.metaKey) || (!platform.isMac && evt.ctrlKey)) &&
      evt.key == "s"
    ) {
      evt.preventDefault();
      saveFile();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcutSave);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcutSave);
    };
  });

  function copyURL() {
    urlField.current.select();
    document.execCommand("copy");
    document.getSelection().empty();
    urlField.current.blur();
    copyButton.current.focus();
  }

  return (
    <Modal
      className={styles.Modal}
      type="global"
      open={true}
      onClose={() => props.onClose()}
    >
      <ModalContent className={styles.ModalContent}>
        <div className={styles.ImageContainer}>
          <figure
            className={cx(styles.Picture, shared.Checkered, shared.Cmodal)}
          >
            <Url
              target="_blank"
              title="Select to download original image in new page"
              href={props.file.url}
            >
              <MediaImage file={props.file} params={"?w=350&type=fit"} />
            </Url>
          </figure>
          <Url
            className={styles.ViewOriginal}
            target="_blank"
            title="Original Image"
            href={props.file.url}
          >
            <FontAwesomeIcon icon={faLink} />
            &nbsp;View Original File
          </Url>
        </div>

        <div className={styles.FieldsContainer}>
          <label className={styles.CopyLabel}>
            <Button
              ref={copyButton}
              className={styles.CopyButton}
              onClick={copyURL}
            >
              <FontAwesomeIcon icon={faCopy} />
              <span>Copy</span>
            </Button>
            <input
              ref={urlField}
              type="text"
              defaultValue={props.file.url}
              readOnly
            />
          </label>
          <FieldTypeText
            className={styles.Field}
            name="title"
            value={title}
            label={
              <label>
                <Infotip title="Edit title. | Use for alt text with Parsley's .getImageTitle()" />
                &nbsp;Title
              </label>
            }
            placeholder={"Image Title"}
            onChange={(val) => setTitle(val)}
          />
          <FieldTypeText
            className={styles.Field}
            name="filename"
            value={filename}
            label={
              <label>
                <Infotip title="Edit Filename " />
                &nbsp;Filename
              </label>
            }
            placeholder={"Image Filename"}
            onChange={(val) => setFilename(val)}
          />
          {/* <FieldTypeText
            className={styles.Field}
            name="alt"
            label={
              <label>
                <Infotip title="Edit Alt Attribute " />
                &nbsp;Alt Attribute
              </label>
            }
            placeholder={"Alt Attribute"}
          /> */}

          <dl className={styles.DescriptionList}>
            <dt>ZUID:</dt>
            <dd>{props.file.id}</dd>
            {props.file.updated_at && (
              <>
                <dt> Created at: </dt>
                <dd>{props.file.updated_at}</dd>
              </>
            )}
          </dl>
        </div>
      </ModalContent>
      <ModalFooter className={shared.ModalFooter}>
        <Button kind="cancel" onClick={props.onClose}>
          <FontAwesomeIcon icon={faBan} />
          <span>Cancel</span>
        </Button>

        <ButtonGroup className={styles.ButtonGroup}>
          {
            /* hide for Contributor */
            userRole.name !== "Contributor" ? (
              <Button
                kind="warn"
                onClick={props.showDeleteFileModal}
                className={styles.Delete}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete</span>
              </Button>
            ) : null
          }

          <Button kind="save" onClick={saveFile}>
            <FontAwesomeIcon icon={faSave} />
            <span>Save (CTRL + S)</span>
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
});
