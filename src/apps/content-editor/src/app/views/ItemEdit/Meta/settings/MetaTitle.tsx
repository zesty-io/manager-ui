import { ChangeEvent, memo, MutableRefObject } from "react";

import { TextField, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { withAI } from "../../../../../../../../shell/components/withAi";

const AIFieldShell = withAI(FieldShell);

type MetaTitleProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  saveMetaTitleParameters?: boolean;
  onResetFlowType: () => void;
  onAIMetaTitleInserted?: () => void;
  aiButtonRef?: MutableRefObject<any>;
  label?: string;
};
export const MetaTitle = memo(function MetaTitle({
  value,
  onChange,
  error,
  saveMetaTitleParameters,
  onResetFlowType,
  onAIMetaTitleInserted,
  aiButtonRef,
  label,
}: MetaTitleProps) {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t("content.itemEditMetaTitle");

  return (
    <Box data-cy="metaTitle" id="metaTitle">
      <AIFieldShell
        ZUID="metaTitle"
        ref={aiButtonRef}
        settings={{
          label: resolvedLabel,
          required: true,
        }}
        customTooltip={t("content.itemEditMetaTitleTooltip")}
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaTitle}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
        aiType="title"
        name="metaTitle"
        value={value}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange(evt.target.value, "metaTitle");
          onAIMetaTitleInserted?.();
        }}
        onResetFlowType={() => {
          onResetFlowType?.();
        }}
      >
        <TextField
          data-cy="metaTitle-input"
          name="metaTitle"
          value={value}
          placeholder={label ? "" : t("content.itemEditMetaTitlePlaceholder")}
          onChange={(evt) => onChange(evt.target.value, "metaTitle")}
          error={hasErrors(error)}
        />
      </AIFieldShell>
    </Box>
  );
});
