import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { Option } from "@zesty-io/core/Select";
import { FieldTypeDropDown } from "@zesty-io/core/FieldTypeDropDown";
import { FieldTypeText } from "@zesty-io/core/FieldTypeText";

import { notify } from "shell/store/notifications";
import { createFile } from "../../../../../store/files";

import styles from "./CreateFile.less";
export const CreateFile = React.memo(function CreateFile(props) {
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
          message: "You must select a file type to create a new file"
        })
      );
      return;
    }
    if (!name) {
      props.dispatch(
        notify({
          kind: "warn",
          message: "You must provide a name for the new file"
        })
      );
      return;
    }

    setLoading(true);

    props
      .dispatch(createFile(name, type))
      .then(res => {
        if (res.status === 201) {
          setOpen(false);
          history.push(`/code/file/${res.pathPart}/${res.data.ZUID}`);
        }
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      <Button
        className={styles.CreateFileBtn}
        onClick={() => setOpen(true)}
        kind="secondary"
        title="Create File"
      >
        <i className="fa fa-plus" aria-hidden="true" />
        <span className={styles.CreateFileBtnTxt}>Create File</span>
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
              onChange={value => {
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
                an extension like /my/file/path.json. The file is accessible at
                hash-dev.preview.zesty.io/my/file/path.json. File types that can
                be used: css, html, json, js, xml, csv, tsv, xml, yaml, md, svg,
                rss, ics, vcf, xhtml.
              </p>
            )}
            <FieldTypeText
              name="file_name"
              label="File Name"
              onChange={value => setName(value)}
            />
          </ModalContent>
          <ModalFooter>
            <ButtonGroup className={styles.ModalActions}>
              <Button
                kind="save"
                onClick={handleCreateFile}
                disabled={type === "" || type === "0" || loading}
              >
                {loading ? (
                  <i className="fas fa-spinner" aria-hidden="true" />
                ) : (
                  <i className="fas fa-check-circle" aria-hidden="true" />
                )}
                Create File
              </Button>
              <Button
                kind="cancel"
                onClick={() => {
                  setName("");
                  setType("");
                  setOpen(false);
                }}
              >
                <i className="fas fa-ban"></i>Cancel (ESC)
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
});
