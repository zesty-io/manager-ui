import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import { CopyButton } from "@zesty-io/core/CopyButton";
import { Input } from "@zesty-io/core/Input";

import { MediaImage } from "./MediaImage";
import { editFile } from "shell/store/media";

import shared from "./MediaShared.less";
import styles from "./MediaDetailsModal.less";
import { Option, Select } from "@zesty-io/core/Select";

export const MediaDetailsModal = memo(function MediaDetailsModal(props) {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.userRole);

  // state for controlled fields
  const [title, setTitle] = useState(props.file.title);
  const [filename, setFilename] = useState(props.file.filename);

  //state for image dimensions
  const [imageDimensions, setImageDimensions] = useState();

  //state for image settings
  const [imageSettings, setImageSettings] = useState({
    width: "",
    height: "",
    optimize: "",
  });

  function saveFile() {
    dispatch(editFile(props.file.id, { title, filename })).then(() => {
      props.onClose();
    });
  }

  const metaShortcut = useMetaKey("s", saveFile);

  const imageTypes = ["jpg", "jpeg", "png", "gif"];

  const baseUrl = props.file.url.substring(0, props.file.url.lastIndexOf("/"));

  const generateImageSettingsQueryParams = () => {
    const queries = Object.keys(imageSettings).filter(
      (key) =>
        imageSettings[key] && imageSettings[key] !== imageDimensions?.[key]
    );
    return queries.map((query) => `${query}=${imageSettings[query]}`).join("&");
  };

  // Get image dimensions
  useEffect(() => {
    const img = new Image();
    img.src = props.file.url;

    img.onload = () => {
      setImageDimensions({ height: img.height, width: img.width });
      setImageSettings({
        ...imageSettings,
        height: img.height,
        width: img.width,
      });
    };
  }, [props.file.url]);

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
          {imageTypes.includes(props.file.filename.split(".").pop()) && (
            <>
              <div className={styles.ImageControls}>
                <label htmlFor="width">Width: </label>
                <Input
                  type="number"
                  name="width"
                  id="width"
                  min={0}
                  onChange={(evt) =>
                    setImageSettings({
                      ...imageSettings,
                      width: Number(evt.target.value),
                    })
                  }
                  value={imageSettings.width}
                />
                <label htmlFor="height">Height: </label>
                <Input
                  type="number"
                  name="height"
                  id="height"
                  min={0}
                  onChange={(evt) =>
                    setImageSettings({
                      ...imageSettings,
                      height: Number(evt.target.value),
                    })
                  }
                  value={imageSettings.height}
                />
                <Select
                  name="optimize"
                  selection={{ value: imageSettings.optimize }}
                  onSelect={(value) =>
                    setImageSettings({
                      ...imageSettings,
                      optimize: value,
                    })
                  }
                >
                  <Option key="optimization" value={null} text="Optimization" />
                  <Option key="Low" value="low" text="Low" />
                  <Option key="medium" value="medium" text="Medium" />
                  <Option key="high" value="high" text="High" />
                </Select>
              </div>
              <CopyButton
                className={styles.otfLink}
                kind="outlined"
                value={`${
                  props.file.url
                }?${generateImageSettingsQueryParams()}`}
              />
            </>
          )}
        </div>
        <div className={styles.FieldsContainer}>
          <FieldTypeText
            className={styles.InputCopyCombo}
            name="filename"
            value={filename}
            label={
              <label>
                <Infotip
                  className={styles.InfotipFileName}
                  title="URL Filename "
                />
                &nbsp;URL Filename
              </label>
            }
            placeholder={"Image Filename"}
            // Replaces all non-alphanumeric characters (excluding '.') with '-' to reflect the filename transformation done on the BE
            onChange={(val) => setFilename(val.replaceAll(/[^a-z\d-.]/gi, "-"))}
          />
          <CopyButton
            className={cx(styles.CopyButton, styles.InputCopyCombo)}
            kind="outlined"
            value={`${baseUrl}/${filename}`}
          />
          <FieldTypeText
            className={styles.Field}
            name="title"
            value={title}
            label={
              <label>
                <Infotip
                  className={styles.InfotipTitle}
                  title=" Use for alt text with Parsley's .getImageTitle() | Image alt text is used to describe your image textually so that search engines and screen readers can understand what that image is. It’s important to note that using alt text correctly can enhance your SEO strategy"
                />
                &nbsp; Alt Title
              </label>
            }
            placeholder={"Image ALT Title"}
            onChange={(val) => setTitle(val)}
          />

          <dl className={styles.DescriptionList}>
            <dt>ZUID:</dt>
            <dd>
              <CopyButton
                kind="outlined"
                size="compact"
                value={props.file.id}
              />
            </dd>
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
        <Button type="cancel" onClick={props.onClose}>
          <FontAwesomeIcon icon={faBan} />
          <span>Cancel</span>
        </Button>

        <ButtonGroup className={styles.ButtonGroup}>
          {
            /* Hide for Contributor */
            userRole.name !== "Contributor" ? (
              <Button
                type="warn"
                onClick={props.showDeleteFileModal}
                className={styles.Delete}
              >
                <FontAwesomeIcon icon={faTrash} />
                <span>Delete</span>
              </Button>
            ) : null
          }

          <Button type="save" onClick={saveFile}>
            <FontAwesomeIcon icon={faSave} />
            Save {metaShortcut}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
});
