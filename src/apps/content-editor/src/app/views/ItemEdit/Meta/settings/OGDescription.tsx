import { TextField, Box } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";

type OGDescriptionProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const OGDescription = ({
  value,
  onChange,
  error,
  field,
}: OGDescriptionProps) => {
  return (
    <Box data-cy="OGDescription">
      <FieldShell
        settings={{
          label: "OG Description",
          required: field.required,
        }}
        customTooltip="This title appears in open graph social media previews (e.g. Facebook) below the title."
        withInteractiveTooltip={false}
        withLengthCounter={!!field.settings.maxCharLimit}
        maxLength={field.settings.maxCharLimit}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="OGTitle"
          value={value}
          multiline
          rows={6}
          onChange={(evt) => onChange(evt.target.value, "og_description")}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
};
