import { Fragment, useState, useEffect } from "react";
import { connect } from "react-redux";

import Button from "@mui/material/Button";

import ReorderIcon from "@mui/icons-material/Reorder";
import SaveIcon from "@mui/icons-material/Save";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import Link from "@mui/material/Link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsAlt,
  faBan,
  faExpandArrowsAlt,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

import { Dropzone } from "./components/Dropzone";
import { Draggable } from "./components/Draggable";

import { Notice } from "@zesty-io/core/Notice";

import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@zesty-io/core/Modal";

import { resolvePathPart } from "../../../../../store/files";
import { fetchHeaders, saveSort } from "../../../../../store/headers";

import styles from "./OrderFiles.less";
export default connect((state, props) => {
  const typePathPart = resolvePathPart(props.type);

  const headersMap = state.headers
    .filter((header) => header.resourceZUID) // must have a resourceZUID
    .reduce((acc, header) => {
      acc[header.resourceZUID] = header;
      return acc;
    }, {}); // convert to map for easy lookups

  const files = state.files.filter((f) => {
    let filePathPart = resolvePathPart(f.type);
    return filePathPart === typePathPart && f.status === state.status.selected;
  });

  // Blend files and header data to create a data set and shape
  // need for the ordering experience
  const fileHeaders = files
    .map((file) => {
      const header = headersMap[file.ZUID];

      return {
        ZUID: file.ZUID,
        fileName: file.fileName,
        sort: header ? header.sort : 1,
      };
    })
    .sort((fileA, fileB) => (fileA.sort > fileB.sort ? 1 : -1));

  return {
    typePathPart,
    fileHeaders,
  };
})(function OrderFiles(props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Track un-saved headers order
  const [files, setFiles] = useState(props.fileHeaders);

  // Update state if external headers change
  useEffect(() => setFiles(props.fileHeaders), [props.fileHeaders]);

  // Get headers if files length changes
  useEffect(() => {
    props.dispatch(fetchHeaders());
  }, [Object.keys(props.fileHeaders).length]);

  // Update headers order
  const handleReorder = (children) => {
    setFiles(
      children.map((child, i) => {
        return {
          ...child.props.file,
          sort: i + 1, // API doesn't allow 0 so bump by 1
        };
      })
    );
  };

  const handleSaveSort = () => {
    setLoading(true);
    props
      .dispatch(saveSort(props.typePathPart, files))
      .then((res) => {
        return props.dispatch(fetchHeaders());
      })
      .finally(() => {
        setOpen(false);
        setLoading(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
    setFiles(props.fileHeaders);
  };

  return (
    <Fragment>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        title="Change combine and pre-process order"
        startIcon={<ZoomOutMapIcon />}
      >
        Order
      </Button>

      {open && (
        <Modal
          className={styles.OrderFilesModal}
          type="global"
          open={open}
          onClose={handleClose}
        >
          <ModalHeader>
            <h2>Order {props.typePathPart}</h2>
          </ModalHeader>
          <ModalContent>
            <p className={styles.Desc}>
              The displayed order is the order in which{" "}
              <Link
                href="https://zesty.org/services/web-engine/css-processing-flow"
                target="_blank"
                title="Learn More About Processing Flows"
              >
                files are processed and concatentated together
              </Link>{" "}
              into the dynamically created{" "}
              {props.typePathPart === "stylesheets" ? (
                <code>site.css</code>
              ) : (
                <code>site.js</code>
              )}{" "}
              file.
            </p>

            <Dropzone className={styles.Files} onDrop={handleReorder}>
              {files.map((file) => {
                return (
                  <Draggable
                    key={file.ZUID}
                    className={styles.File}
                    draggable={true}
                    file={file}
                  >
                    <span className={styles.Position}>{`${Number(
                      file.sort
                    )})`}</span>
                    <FontAwesomeIcon
                      className={styles.Icon}
                      icon={faExpandArrowsAlt}
                    />
                    <span className={styles.Name}>{file.fileName}</span>
                  </Draggable>
                );
              })}
            </Dropzone>

            <Notice>
              After ordering a publish has to occur to process the new order and
              make the change live.
            </Notice>
          </ModalContent>
          <ModalFooter>
            <Button
              variant="contained"
              data-cy="saveOrder"
              color="success"
              onClick={handleSaveSort}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              Save Order
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              startIcon={<DoDisturbAltIcon />}
            >
              Cancel (ESC)
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Fragment>
  );
});
