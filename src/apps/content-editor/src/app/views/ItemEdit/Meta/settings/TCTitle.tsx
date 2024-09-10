import { TextField, Box } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";

type TCTitleProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const TCTitle = ({ value, onChange, error, field }: TCTitleProps) => {
  return (
    <Box data-cy="TCTitle">
      <FieldShell
        settings={{
          label: "TC Title",
          required: true,
        }}
        customTooltip="This title appears in twitter card social media previews."
        withInteractiveTooltip={false}
        withLengthCounter={!!field.settings.maxCharLimit}
        maxLength={field.settings.maxCharLimit}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="TCTitle"
          value={value}
          onChange={(evt) => onChange(evt.target.value, "tc_title")}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
};