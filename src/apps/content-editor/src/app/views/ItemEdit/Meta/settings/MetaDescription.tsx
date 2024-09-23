import { useState, useEffect, ChangeEvent } from "react";
import { connect, useDispatch } from "react-redux";
import { TextField, Box } from "@mui/material";

import { notify } from "../../../../../../../../shell/store/notifications";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { withAI } from "../../../../../../../../shell/components/withAi";

const AIFieldShell = withAI(FieldShell);

type MetaDescriptionProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  onResetFlowType: () => void;
};
export default connect()(function MetaDescription({
  value,
  onChange,
  error,
  onResetFlowType,
}: MetaDescriptionProps) {
  const dispatch = useDispatch();
  const [contentValidationError, setContentValidationError] = useState("");

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

      setContentValidationError(message);
    }
  }, [value]);

  if (contentValidationError) {
    dispatch(
      notify({
        kind: "warn",
        message: contentValidationError,
      })
    );
  }

  return (
    <Box data-cy="metaDescription" id="metaDescription">
      <AIFieldShell
        settings={{
          label: "Meta Description",
          required: true,
        }}
        customTooltip="This description appears as text snippet below the title in search engine and social media previews. The ideal length for a meta description is 50 to 160 characters."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaDescription}
        valueLength={value?.length ?? 0}
        errors={
          contentValidationError
            ? {
                ...(error || {}),
                CUSTOM_ERROR: contentValidationError,
              }
            : error
        }
        aiType="description"
        name="metaDescription"
        value={value}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange(evt.target.value, "metaDescription");
          onResetFlowType?.();
        }}
        onResetFlowType={() => {
          onResetFlowType?.();
        }}
      >
        <TextField
          name="metaDescription"
          value={value}
          placeholder="This is the description search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaDescription")}
          multiline
          rows={3}
          error={hasErrors(error) || !!contentValidationError}
        />
      </AIFieldShell>
    </Box>
  );
});
