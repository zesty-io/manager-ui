import { memo } from "react";

import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { Error } from "../../../../components/Editor/Field/FieldShell";

type MetaLinkTextProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
};
export const MetaLinkText = memo(function MetaLinkText({
  value,
  onChange,
  error,
}: MetaLinkTextProps) {
  const { t } = useTranslation();

  return (
    <Box data-cy="metaLinkText">
      <FieldShell
        settings={{
          label: t("content.itemEditMetaNavigationLinkText"),
        }}
        customTooltip={t("content.itemEditMetaNavigationLinkTextTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaLinkText}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="metaLinkText"
          value={value || ""}
          placeholder={t("content.itemEditMetaNavigationLinkTextPlaceholder")}
          onChange={(evt) => onChange(evt.target.value, "metaLinkText")}
        />
      </FieldShell>
    </Box>
  );
});
