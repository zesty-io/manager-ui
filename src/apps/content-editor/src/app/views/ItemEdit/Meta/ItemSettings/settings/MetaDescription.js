import React, { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { Infotip } from "@zesty-io/core/Infotip";

import { notify } from "shell/store/notifications";

import styles from "./MetaDescription.less";
export const MetaDescription = React.memo(function MetaDescription({
  meta_description,
  onChange
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
    notify({
      kind: "warn",
      message: error
    });
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
            <Infotip title="This is the description search engines should use in their results. This field is limited to 160 characters, the maximum amount search engines will display." />
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
