import { memo, Fragment, useState } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Option } from "@zesty-io/core/Select";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";

import { notify } from "shell/store/notifications";
import { createFile } from "../../../../../store/files";

import styles from "./CreateFile.less";
export const CreateFile = memo(function CreateFile(props) {
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [name, setName] = useState("");

  const handleCreateFile = () => {
    if (!type) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "You must select a file type to create a new file",
        })
      );
      return;
    }
    if (!name) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "You must provide a name for the new file",
        })
      );
      return;
    }

    if (type === "ajax-json" && name.charAt(0) !== "/") {
      props.dispatch(
        notify({
          kind: "warn",
          message: `Please add leading slash in file path EX: /${name}`,
        })
      );
      return;
    }

    setLoading(true);

    props
      .dispatch(createFile(name, type))
      .then((res) => {
        if (res.status === 201) {
          setOpen(false);
          history.push(`/code/file/${res.pathPart}/${res.data.ZUID}`);
        }
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setOpen(true)}
        title="Create File"
        startIcon={<AddIcon />}
        sx={{ justifyContent: "flex-start" }}
      >
        <span>Create File</span>
      </Button>

      {open && (
        <Modal
          className={styles.CreateFile}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalContent className={styles.ModalContent}>
            <FieldTypeDropDown
              name="file_type"
              className={styles.FileType}
              label="File Type"
              defaultOptText="-- choose a file type --"
              onChange={(value) => {
                setType(value);
              }}
            >
              <Option value="snippet" text="Snippet (html)" />
              <Option value="text/css" text="CSS File (css)" />
              <Option value="text/less" text="LESS File (less)" />
              <Option value="text/scss" text="SCSS File (scss/sass)" />
              <Option value="text/javascript" text="JavaScript File (js)" />
              <Option
                value="ajax-json"
                text="Custom File Type/Endpoint (Mixed Extensions)"
              />
            </FieldTypeDropDown>
            {type === "snippet" && (
              <p className={styles.description}>
                Parsley accessible file meant to abstract common use of code, or
                for organizing file build. Examples: slider, footer, header.
                These can be used inside of each loops as well.
              </p>
            )}
            {type === "text/css" && (
              <p className={styles.description}>
                A cascading stylesheet that is automatically concatenated into a
                single css file /main.css which is auto included in the head of
                webengine web pages. Sort Order of the concatenation can be
                controlled. No transpiling occurs.
              </p>
            )}
            {type === "text/less" && (
              <p className={styles.description}>
                Has access to settings &gt; variables. A cascading stylesheet
                that is automatically concatenated into a the single /main.css.
                Sort Order of the concatenation and transpiling can be
                controlled.
              </p>
            )}
            {type === "text/scss" && (
              <p className={styles.description}>
                Has access to settings &gt; variables. A cascading stylesheet
                that is automatically concatenated into a the single /main.css.
                Sort Order of the concatenation and transpiling can be
                controlled.
              </p>
            )}
            {type === "text/javascript" && (
              <p className={styles.description}>
                A javascript file that is automatically concatenated into a the
                single /main.js file that is automatically loaded by webengine.
                No transpiling occurs.
              </p>
            )}
            {type === "ajax-json" && (
              <p className={styles.description}>
                Parsley accessible file for creating endpoints or custom
                experiences. These files need to be named with a full path with
                an extension like <strong> /my/file/path.json.</strong> The file
                is accessible at hash-dev.preview.zesty.io/my/file/path.json.
                File types that can be used: css, html, json, js, xml, csv, tsv,
                xml, yaml, md, svg, rss, ics, vcf, xhtml.
              </p>
            )}
            <FieldTypeText
              name="file_name"
              label="File Name"
              onChange={(value) => setName(value)}
            />
          </ModalContent>
          <ModalFooter>
            <ButtonGroup className={styles.ModalActions}>
              <Button
                variant="contained"
                color="success"
                onClick={handleCreateFile}
                disabled={type === "" || type === "0" || loading}
                startIcon={
                  loading ? (
                    <CircularProgress size="1rem" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
              >
                Create File
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setName("");
                  setType("");
                  setOpen(false);
                }}
                startIcon={<DoDisturbAltIcon />}
              >
                Cancel (ESC)
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      )}
    </Fragment>
  );
});
