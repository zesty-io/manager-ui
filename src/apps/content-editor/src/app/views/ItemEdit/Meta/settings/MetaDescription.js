import { useState, useEffect } from "react";
import { connect } from "react-redux";
import { TextField } from "@mui/material";

import { notify } from "shell/store/notifications";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../NewMeta";

import styles from "./MetaDescription.less";
export default connect()(function MetaDescription({
  value,
  onChange,
  dispatch,
  errors,
}) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (value) {
      let message = "";

      if (!(value.indexOf("\u0152") === -1)) {
        message =
          "Found OE ligature. These special characters are not allowed in meta descriptions.";
      } else if (!(value.indexOf("\u0153") === -1)) {
        message =
          "Found oe ligature. These special characters are not allowed in meta descriptions.";
      } else if (!(value.indexOf("\xAB") === -1)) {
        message =
          "Found << character. These special characters are not allowed in meta descriptions.";
      } else if (!(value.indexOf("\xBB") === -1)) {
        message =
          "Found >> character. These special characters are not allowed in meta descriptions.";
      } else if (/[\u201C\u201D\u201E]/.test(value)) {
        message =
          "Found Microsoft smart double quotes and apostrophe. These special characters are not allowed in meta descriptions.";
      } else if (/[\u2018\u2019\u201A]/.test(value)) {
        message =
          "Found Microsoft Smart single quotes and apostrophe. These special characters are not allowed in meta descriptions.";
      }

      setError(message);
    }
  }, [value]);

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
        maxLength={MaxLengths.metaDescription}
        valueLength={value?.length ?? 0}
        errors={
          error
            ? {
                ...(errors?.metaDescription ? errors.metaDescription : {}),
                CUSTOM_ERROR: error,
              }
            : errors?.metaDescription
        }
      >
        <TextField
          name="metaDescription"
          value={value}
          placeholder="This is the description search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaDescription")}
          multiline
          rows={6}
        />
      </FieldShell>
    </article>
  );
});
