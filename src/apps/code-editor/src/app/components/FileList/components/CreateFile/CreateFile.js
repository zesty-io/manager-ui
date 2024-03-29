import { memo, Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoadingButton from "@mui/lab/LoadingButton";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Modal, ModalContent, ModalFooter } from "@zesty-io/core/Modal";
import { FieldTypeText } from "@zesty-io/material";
import { FormControl, FormLabel, Select, MenuItem } from "@mui/material";

import { notify } from "shell/store/notifications";
import { createFile } from "../../../../../store/files";
import { useParams } from "shell/hooks/useParams";

import styles from "./CreateFile.less";
export const CreateFile = memo(function CreateFile(props) {
  const history = useHistory();
  const [params] = useParams();
  const triggerCreate = params.get("triggerCreate");
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

  useEffect(() => {
    if (triggerCreate) {
      setOpen(true);
      history.replace("/code");
    }
  }, [triggerCreate]);

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
            <FormControl fullWidth sx={{ mb: 2 }} size="small">
              <FormLabel>File Type</FormLabel>
              <Select
                name="file_type"
                variant="outlined"
                displayEmpty
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
              >
                <MenuItem value="">-- choose a file type --</MenuItem>
                <MenuItem value="snippet">Snippet (html)</MenuItem>
                <MenuItem value="text/css">CSS File (css)</MenuItem>
                <MenuItem value="text/less">LESS File (less)</MenuItem>
                <MenuItem value="text/scss">SCSS File (scss/sass)</MenuItem>
                <MenuItem value="text/javascript">
                  JavaScript File (js)
                </MenuItem>
                <MenuItem value="ajax-json">
                  Custom File Type/Endpoint (Mixed Extensions)
                </MenuItem>
              </Select>
            </FormControl>
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
              value={name}
              onChange={(evt) => setName(evt.target.value)}
              maxLength={100}
            />
          </ModalContent>
          <ModalFooter>
            <ButtonGroup className={styles.ModalActions}>
              <LoadingButton
                variant="contained"
                color="success"
                onClick={handleCreateFile}
                disabled={type === "" || type === "0"}
                loading={loading}
                loadingPosition="start"
                startIcon={<CheckCircleIcon />}
              >
                Create File
              </LoadingButton>
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
