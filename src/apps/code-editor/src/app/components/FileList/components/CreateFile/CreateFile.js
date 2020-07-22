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
      notify({
        kind: "warn",
        message: "You must select a file type to create a new file"
      });
      return;
    }
    if (!name) {
      notify({
        kind: "warn",
        message: "You must provide a name for the new file"
      });
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
        title="Create New File"
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
              onChange={value => {
                setType(value);
              }}
            >
              <Option value="snippet" text="Snippet" />
              <Option value="text/css" text="CSS File" />
              <Option value="text/less" text="LESS File" />
              <Option value="text/scss" text="SCSS File" />
              <Option value="text/javascript" text="JavaScript File" />
              <Option value="ajax-json" text="Custom File Type" />
            </FieldTypeDropDown>
            <FieldTypeText
              name="file_name"
              label="File Name"
              onChange={value => setName(value)}
            />
          </ModalContent>
          <ModalFooter>
            <ButtonGroup className={styles.ModalActions}>
              <Button kind="save" onClick={handleCreateFile} disabled={loading}>
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
