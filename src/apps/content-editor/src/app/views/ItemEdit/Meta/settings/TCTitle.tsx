import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { ContentModelField } from "../../../../../../../../shell/services/types";
import { MaxLengths } from "../index";

type TCTitleProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  field: ContentModelField;
};
export const TCTitle = ({ value, onChange, error, field }: TCTitleProps) => {
  const { t } = useTranslation();

  return (
    <Box data-cy="TCTitle" id={field.ZUID}>
      <FieldShell
        settings={{
          label: field.label,
          required: field.required,
        }}
        customTooltip={t("content.itemEditMetaTcTitleTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.tc_title}
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
