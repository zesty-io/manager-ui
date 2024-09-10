import { TextField, Box } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";

type TCDescriptionProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const TCDescription = ({
  value,
  onChange,
  error,
  field,
}: TCDescriptionProps) => {
  return (
    <Box data-cy="TCDescription">
      <FieldShell
        settings={{
          label: "TC Description",
          required: field.required,
        }}
        customTooltip="This title appears in twitter card social media previews below the title."
        withInteractiveTooltip={false}
        withLengthCounter={!!field.settings.maxCharLimit}
        maxLength={field.settings.maxCharLimit}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="TCDescription"
          value={value}
          multiline
          rows={6}
          onChange={(evt) => onChange(evt.target.value, "tc_description")}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
};
