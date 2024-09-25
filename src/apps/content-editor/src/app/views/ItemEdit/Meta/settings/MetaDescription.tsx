import { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { TextField, Box } from "@mui/material";

import { notify } from "../../../../../../../../shell/store/notifications";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";

type MetaDescriptionProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
};
export default connect()(function MetaDescription({
  value,
  onChange,
  error,
}: MetaDescriptionProps) {
  return (
    <Box data-cy="metaDescription" id="metaDescription">
      <FieldShell
        settings={{
          label: "Meta Description",
          required: true,
        }}
        customTooltip="This description appears as text snippet below the title in search engine and social media previews. The ideal length for a meta description is 50 to 160 characters."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaDescription}
        valueLength={value?.length ?? 0}
        errors={error}
      >
        <TextField
          name="metaDescription"
          value={value}
          placeholder="This is the description search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaDescription")}
          multiline
          rows={3}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
});
