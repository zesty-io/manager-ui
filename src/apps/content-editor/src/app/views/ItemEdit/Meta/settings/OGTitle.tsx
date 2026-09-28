import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";
import { MaxLengths } from "..";

type OGTitleProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const OGTitle = ({ value, onChange, error, field }: OGTitleProps) => {
  const { t } = useTranslation();

  return (
    <Box data-cy="OGTitle" id={field.ZUID}>
      <FieldShell
        settings={{
          label: field.label,
          required: field.required,
        }}
        customTooltip={t("content.itemEditMetaOgTitleTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.og_title}
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
