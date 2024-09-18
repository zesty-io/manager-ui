import { memo } from "react";

import { TextField, Box } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { Error } from "../../../../components/Editor/Field/FieldShell";

type MetaKeywordsProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
};
export const MetaKeywords = memo(function MetaKeywords({
  value,
  onChange,
  error,
}: MetaKeywordsProps) {
  return (
    <Box data-cy="metaKeywords">
      <FieldShell
        settings={{
          label: "Meta Keywords",
        }}
        customTooltip="Keywords are comma separated words or phrase that describe your page. In 2011 Google denounced keywords; keywords are only used against your page ranking. Use them with caution."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaKeywords}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="metaKeywords"
          value={value ?? ""}
          placeholder="comma, separated, keywords"
          rows={3}
          multiline
          onChange={(evt) => onChange(evt.target.value, "metaKeywords")}
        />
      </FieldShell>
    </Box>
  );
});
