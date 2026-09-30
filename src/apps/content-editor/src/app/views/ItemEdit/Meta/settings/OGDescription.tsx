import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";
import { MaxLengths } from "..";

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
  const { t } = useTranslation();

  return (
    <Box data-cy="OGDescription" id={field.ZUID}>
      <FieldShell
        settings={{
          label: field.label,
          required: field.required,
        }}
        customTooltip={t("content.itemEditMetaOgDescriptionTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.og_description}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="OGDescription"
          value={value}
          multiline
          rows={3}
          onChange={(evt) => onChange(evt.target.value, "og_description")}
          error={hasErrors(error)}
        />
      </FieldShell>
    </Box>
  );
};
