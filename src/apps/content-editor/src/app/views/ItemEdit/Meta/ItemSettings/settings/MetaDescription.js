import { useState, useEffect } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import Tooltip from "@mui/material/Tooltip";

import { notify } from "shell/store/notifications";

import styles from "./MetaDescription.less";
export default connect()(function MetaDescription({
  meta_description,
  onChange,
  dispatch,
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (meta_description) {
      let message = "";

      if (!(meta_description.indexOf("\u0152") === -1)) {
        message =
          "Found OE ligature. These special characters are not allowed in meta descriptions.";
      } else if (!(meta_description.indexOf("\u0153") === -1)) {
        message =
          "Found oe ligature. These special characters are not allowed in meta descriptions.";
      } else if (!(meta_description.indexOf("\xAB") === -1)) {
        message =
          "Found << character. These special characters are not allowed in meta descriptions.";
      } else if (!(meta_description.indexOf("\xBB") === -1)) {
        message =
          "Found >> character. These special characters are not allowed in meta descriptions.";
      } else if (/[\u201C\u201D\u201E]/.test(meta_description)) {
        message =
          "Found Microsoft smart double quotes and apostrophe. These special characters are not allowed in meta descriptions.";
      } else if (/[\u2018\u2019\u201A]/.test(meta_description)) {
        message =
          "Found Microsoft Smart single quotes and apostrophe. These special characters are not allowed in meta descriptions.";
      }

      setError(message);
    }
  }, [meta_description]);

  if (error) {
    dispatch(
      notify({
        kind: "warn",
        message: error,
      })
    );
  }

  return (
    <article className={styles.MetaDescription} data-cy="metaDescription">
      {/* Display errors */}
      {error && (
        <p className={styles.error}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          &nbsp;{error}
        </p>
      )}

      <FieldTypeTextarea
        name="metaDescription"
        label={
          <label>
            <Tooltip
              title="This is the description search engines should use in their results. This field is limited to 160 characters, the maximum amount search engines will display."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Meta Description
          </label>
        }
        value={meta_description}
        placeholder="This is the description search engines should use in their results"
        maxLength="160"
        onChange={onChange}
      />
    </article>
  );
});
