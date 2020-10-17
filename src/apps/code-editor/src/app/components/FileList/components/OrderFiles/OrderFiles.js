import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { Dropzone } from "./components/Dropzone";
import { Draggable } from "./components/Draggable";

import { Url } from "@zesty-io/core/Url";
import { Notice } from "@zesty-io/core/Notice";
import { Button } from "@zesty-io/core/Button";
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@zesty-io/core/Modal";

import { resolvePathPart } from "../../../../../store/files";
import { fetchHeaders, saveSort } from "../../../../../store/headers";

import styles from "./OrderFiles.less";
export default connect((state, props) => {
  const typePathPart = resolvePathPart(props.type);

  const headersMap = state.headers
    .filter(header => header.resourceZUID) // must have a resourceZUID
    .reduce((acc, header) => {
      acc[header.resourceZUID] = header;
      return acc;
    }, {}); // convert to map for easy lookups

  const files = state.files.filter(f => {
    let filePathPart = resolvePathPart(f.type);
    return filePathPart === typePathPart && f.status === state.status.selected;
  });

  // Blend files and header data to create a data set and shape
  // need for the ordering experience
  const fileHeaders = files
    .map(file => {
      const header = headersMap[file.ZUID];

      return {
        ZUID: file.ZUID,
        fileName: file.fileName,
        sort: header ? header.sort : 1
      };
    })
    .sort((fileA, fileB) => (fileA.sort > fileB.sort ? 1 : -1));

  return {
    typePathPart,
    fileHeaders
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
  const handleReorder = children => {
    setFiles(
      children.map((child, i) => {
        return {
          ...child.props.file,
          sort: i + 1 // API doesn't allow 0 so bump by 1
        };
      })
    );
  };

  const handleSaveSort = () => {
    setLoading(true);
    props
      .dispatch(saveSort(props.typePathPart, files))
      .then(res => {
        return props.dispatch(fetchHeaders());
      })
      .finally(() => {
        setOpen(false);
        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      <Button
        onClick={() => setOpen(true)}
        kind="primary"
        title="Change combine and pre-process order"
      >
        <i className="fas fa-arrows-alt" aria-hidden="true" />
        <span>Order</span>
      </Button>

      {open && (
        <Modal
          className={styles.OrderFilesModal}
          open={open}
          onClose={() => setOpen(false)}
        >
          <ModalHeader>
            <h2>Order {props.typePathPart}</h2>
          </ModalHeader>
          <ModalContent>
            <p className={styles.Desc}>
              The displayed order is the order in which{" "}
              <Url
                href="https://zesty.org/services/web-engine/css-processing-flow"
                target="_blank"
                title="Learn More About Processing Flows"
              >
                files are processed and concatentated together
              </Url>{" "}
              into the dynamically created{" "}
              {props.typePathPart === "stylesheets" ? (
                <code>site.css</code>
              ) : (
                <code>site.js</code>
              )}{" "}
              file.
            </p>

            <Dropzone className={styles.Files} onDrop={handleReorder}>
              {files.map(file => {
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
                    <span className={styles.Name}>{file.fileName}</span>
                    <i
                      className={cx("fas fa-expand-arrows-alt", styles.Icon)}
                    />
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
            <Button kind="save" onClick={handleSaveSort} disabled={loading}>
              <i className="fas fa-save"></i> Save Order
            </Button>
            <Button kind="cancel" onClick={() => setOpen(false)}>
              <i className="fas fa-ban"></i> Cancel (ESC)
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </React.Fragment>
  );
});
