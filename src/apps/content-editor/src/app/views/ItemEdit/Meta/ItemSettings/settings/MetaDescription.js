import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { TextField } from "@mui/material";

import { notify } from "shell/store/notifications";
import { FieldShell } from "../../../../../components/Editor/Field/FieldShell";

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
      <FieldShell
        settings={{
          label: "Meta Description",
        }}
        customTooltip="This is the description search engines should use in their results. This field is limited to 160 characters, the maximum amount search engines will display."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={160}
        valueLength={meta_description?.length ?? 0}
        errors={error ? { CUSTOM_ERROR: error } : {}}
      >
        <TextField
          name="metaDescription"
          value={meta_description}
          placeholder="This is the description search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaDescription")}
          multiline
          rows={6}
        />
      </FieldShell>
    </article>
  );
});
