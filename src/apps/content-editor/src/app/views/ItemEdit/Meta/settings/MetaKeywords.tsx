import { memo } from "react";

import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <Box data-cy="metaKeywords" id="metaKeywords">
      <FieldShell
        settings={{
          label: t("content.itemEditMetaKeywords"),
        }}
        customTooltip={t("content.itemEditMetaKeywordsTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaKeywords}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="metaKeywords"
          value={value ?? ""}
          placeholder={t("content.itemEditMetaKeywordsPlaceholder")}
          rows={3}
          multiline
          onChange={(evt) => onChange(evt.target.value, "metaKeywords")}
        />
      </FieldShell>
    </Box>
  );
});
