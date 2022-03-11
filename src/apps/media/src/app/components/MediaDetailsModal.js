import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTrash, faBan } from "@fortawesome/free-solid-svg-icons";

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
    width: 0,
    height: 0,
    optimize: "medium",
    fit: "none",
  });

  function saveFile() {
    dispatch(editFile(props.file.id, { title, filename })).then(() => {
      props.onClose();
    });
  }

  const metaShortcut = useMetaKey("s", saveFile);
  const imageTypes = ["jpg", "jpeg", "png", "gif"];

  const generateImageSettingsQueryParams = () => {
    return `?${Object.keys(imageSettings)
      .map((key) => `${key}=${imageSettings[key]}`)
      .join("&")}`;
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
              href={`${props.file.url}${generateImageSettingsQueryParams()}`}
            >
              <MediaImage
                src={`${props.file.url}${generateImageSettingsQueryParams()}`}
                file={props.file}
              />
            </Url>
          </figure>
        </div>
        <div className={styles.Meta}>
          <div className={styles.FieldsContainer}>
            <FieldTypeText
              className={styles.Field}
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
              onChange={(val) =>
                setFilename(val.replaceAll(/[^a-z\d-.]/gi, "-"))
              }
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
          </div>

          <div className={styles.editor}>
            {imageTypes.includes(props.file.filename.split(".").pop()) && (
              <>
                <h3>
                  <Url
                    target="_blank"
                    href="https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation"
                  >
                    On-The-Fly Image Editor
                  </Url>
                </h3>
                <div className={styles.ImageControls}>
                  <div>
                    <label htmlFor="optimize">Optimize: </label>
                    <Select
                      name="optimize"
                      value={imageSettings.optimize}
                      onSelect={(value) =>
                        setImageSettings({
                          ...imageSettings,
                          optimize: value,
                        })
                      }
                    >
                      <Option key="high" value="high" text="High" />
                      <Option key="medium" value="medium" text="Medium" />
                      <Option key="low" value="low" text="Low" />
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="fit">Fit: </label>
                    <Select
                      name="fit"
                      value={imageSettings.fit}
                      onSelect={(value) =>
                        setImageSettings({
                          ...imageSettings,
                          fit: value,
                        })
                      }
                    >
                      <Option key="none" value="none" text="none" />
                      <Option key="bounds" value="bounds" text="Bounds" />
                      <Option key="cover" value="cover" text="Cover" />
                      <Option key="crop" value="crop" text="Crop" />
                    </Select>
                  </div>
                  <div>
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
                  </div>
                  <div>
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
                  </div>
                </div>
              </>
            )}
            <CopyButton
              className={styles.otfLink}
              kind="outlined"
              value={`${props.file.url}${generateImageSettingsQueryParams()}`}
            />
          </div>

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
              <Button type="warn" onClick={props.showDeleteFileModal}>
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
