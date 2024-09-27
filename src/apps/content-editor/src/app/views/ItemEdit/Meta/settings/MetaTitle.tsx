import { ChangeEvent, memo, MutableRefObject } from "react";

import { TextField, Box } from "@mui/material";

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
};
export const MetaTitle = memo(function MetaTitle({
  value,
  onChange,
  error,
  saveMetaTitleParameters,
  onResetFlowType,
  onAIMetaTitleInserted,
  aiButtonRef,
}: MetaTitleProps) {
  return (
    <Box data-cy="metaTitle" id="metaTitle">
      <AIFieldShell
        ref={aiButtonRef}
        settings={{
          label: "Meta Title",
          required: true,
        }}
        customTooltip="This title appears in search engine results and social media previews. The maximum amount of characters search engines show is 65, but your title can be longer."
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
        saveMetaTitleParameters={saveMetaTitleParameters}
        onResetFlowType={() => {
          onResetFlowType?.();
        }}
      >
        <TextField
          name="metaTitle"
          value={value}
          placeholder="This is the title search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaTitle")}
          error={hasErrors(error)}
        />
      </AIFieldShell>
    </Box>
  );
});
