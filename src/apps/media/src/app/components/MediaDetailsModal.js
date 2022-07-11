import { memo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { Box, Link, Tooltip, Button, Select, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { FieldTypeText } from "@zesty-io/material";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import { CopyButton } from "@zesty-io/material";
import { Input } from "@zesty-io/core/Input";

import { MediaImage } from "./MediaImage";
import { editFile } from "shell/store/media";

import { formatMediaFilename } from "../../../../../utility/formatMediaFileName";

import shared from "./MediaShared.less";
import styles from "./MediaDetailsModal.less";

export const MediaDetailsModal = memo(function MediaDetailsModal(props) {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.userRole);

  // state for controlled fields
  const [title, setTitle] = useState(props.file.title);
  const [filename, setFilename] = useState(props.file.filename);

  //state for image settings
  const [imageSettings, setImageSettings] = useState({
    width: 0,
    height: 0,
    optimize: "none",
    fit: "none",
  });

  function saveFile() {
    dispatch(editFile(props.file.id, { title, filename })).then(() => {
      props.onClose();
    });
  }

  const metaShortcut = useMetaKey("s", saveFile);
  const imageTypes = ["jpg", "jpeg", "png", "webp"];

  const genImageURL = () => {
    const params = `${Object.keys(imageSettings)
      .filter((key) => imageSettings[key] && imageSettings[key] !== "none")
      .map((key) => `${key}=${imageSettings[key]}`)
      .join("&")}`;

    return params ? `${props.file.url}?${params}` : props.file.url;
  };

  useEffect(() => {
    // Get image dimensions for support types
    if (imageTypes.includes(props.file.filename.split(".").pop())) {
      const img = new Image();
      img.src = props.file.url;

      img.onload = () => {
        setImageSettings({
          ...imageSettings,
          height: img.height,
          width: img.width,
        });
      };
    }
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
            <Link
              underline="none"
              color="secondary"
              target="_blank"
              title="Select to download original image in new page"
              href={`${genImageURL()}`}
            >
              <MediaImage src={`${genImageURL()}`} file={props.file} />
            </Link>
          </figure>
        </div>
        <div className={styles.Meta}>
          <div>
            <FieldTypeText
              name="filename"
              value={filename}
              label={
                <Box component="span" sx={{ display: "flex" }}>
                  <Tooltip title="URL Filename " arrow placement="top-start">
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                  &nbsp;URL Filename
                </Box>
              }
              placeholder={"Image Filename"}
              // Replaces all non-alphanumeric characters (excluding '.') with '-' to reflect the filename transformation done on the BE
              onChange={(evt) =>
                setFilename(formatMediaFilename(evt.target.value))
              }
            />
            <FieldTypeText
              name="title"
              value={title}
              label={
                <Box component="span" sx={{ display: "flex" }}>
                  <Tooltip
                    title="Use for alt text with Parsley's .getImageTitle() | Image alt text is used to describe your image textually so that search engines and screen readers can understand what that image is. It’s important to note that using alt text correctly can enhance your SEO strategy"
                    arrow
                    placement="top-start"
                  >
                    <InfoIcon fontSize="small" />
                  </Tooltip>
                  &nbsp;Alt Text
                </Box>
              }
              onChange={(evt) => setTitle(evt.target.value)}
            />
          </div>

          <div className={styles.editor}>
            {imageTypes.includes(props.file.filename.split(".").pop()) && (
              <>
                <h3>
                  <Link
                    underline="none"
                    color="secondary"
                    target="_blank"
                    href="https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation"
                  >
                    On-The-Fly Image Editor
                  </Link>
                </h3>
                <div className={styles.ImageControls}>
                  <div>
                    <label htmlFor="optimize">Optimize: </label>
                    <Select
                      className={styles.Select}
                      name="optimize"
                      value={imageSettings.optimize}
                      onChange={(e) =>
                        setImageSettings({
                          ...imageSettings,
                          optimize: e.target.value,
                        })
                      }
                      size="small"
                    >
                      <MenuItem key="none" value="none">
                        — None —
                      </MenuItem>
                      <MenuItem key="high" value="high">
                        High
                      </MenuItem>
                      <MenuItem key="medium" value="medium">
                        Medium
                      </MenuItem>
                      <MenuItem key="low" value="low" text="Low">
                        Low
                      </MenuItem>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="fit">Fit: </label>
                    <Select
                      className={styles.Select}
                      name="fit"
                      value={imageSettings.fit}
                      onChange={(e) =>
                        setImageSettings({
                          ...imageSettings,
                          fit: e.target.value,
                        })
                      }
                      size="small"
                    >
                      <MenuItem key="none" value="none">
                        — None —
                      </MenuItem>
                      <MenuItem key="bounds" value="bounds">
                        Bounds
                      </MenuItem>
                      <MenuItem key="cover" value="cover">
                        Cover
                      </MenuItem>
                      <MenuItem key="crop" value="crop">
                        Crop
                      </MenuItem>
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
              value={`${genImageURL()}`}
              sx={{
                justifyContent: "flex-start",
                wordBreak: "break-all",
              }}
            />
          </div>

          <ul className={styles.info}>
            <li>
              <p>ZUID:</p>
              <CopyButton
                size="small"
                value={props.file.id}
                sx={{ alignSelf: "flex-start" }}
              />
            </li>
            <li>
              <p>Created at:</p>
              {props.file.updated_at}
            </li>
            <li>
              {" "}
              <Link
                underline="none"
                color="secondary"
                target="_blank"
                title="Original Image"
                href={props.file.url}
              >
                <FontAwesomeIcon icon={faLink} />
                &nbsp;View Original File
              </Link>
            </li>
          </ul>
        </div>
      </ModalContent>
      <ModalFooter className={shared.ModalFooter}>
        {
          /* Hide for Contributor */
          userRole.name !== "Contributor" ? (
            <Button
              variant="contained"
              color="error"
              onClick={props.showDeleteFileModal}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          ) : null
        }

        <ButtonGroup className={styles.ButtonGroup}>
          <Button
            variant="contained"
            onClick={props.onClose}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={saveFile}
            startIcon={<SaveIcon />}
          >
            Save {metaShortcut}
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
});
