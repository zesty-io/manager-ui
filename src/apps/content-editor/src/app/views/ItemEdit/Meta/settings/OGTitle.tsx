import { TextField, Box } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";

type OGTitleProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const OGTitle = ({ value, onChange, error, field }: OGTitleProps) => {
  return (
    <Box data-cy="OGTitle">
      <FieldShell
        settings={{
          label: "OG Title",
          required: true,
        }}
        customTooltip="This title appears in open graph social media previews (e.g. Facebook)."
        withInteractiveTooltip={false}
        withLengthCounter={!!field.settings.maxCharLimit}
        maxLength={field.settings.maxCharLimit}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="OGTitle"
          value={value}
          onChange={(evt) => onChange(evt.target.value, "og_title")}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
};
