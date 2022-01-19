import { useRef, Fragment } from "react";
import { useDispatch } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { uploadFile } from "shell/store/media";

import styles from "./UploadImage.less";

export default function UploadImage(props) {
  const dispatch = useDispatch();

  const hiddenFileInput = useRef(null);

  function handleUploadClick() {
    hiddenFileInput.current.click();
  }

  function handleFileInputChange(event) {
    Array.from(event.target.files).forEach((file) => {
      const fileToUpload = {
        file,
        bin_id: props.currentBin.id,
        group_id: props.currentGroup.id,
      };
      dispatch(uploadFile(fileToUpload, props.currentBin));
    });
  }
  return (
    <Fragment>
      <Button aria-label="Upload" kind="secondary" onClick={handleUploadClick}>
        <FontAwesomeIcon icon={faUpload} />
        <span>Upload</span>
      </Button>
      <input
        type="file"
        multiple
        ref={hiddenFileInput}
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
    </Fragment>
  );
}
