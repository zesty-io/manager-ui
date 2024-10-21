import { useState, useEffect, ChangeEvent } from "react";
import { connect, useDispatch } from "react-redux";
import { TextField, Box } from "@mui/material";

import { notify } from "../../../../../../../../shell/store/notifications";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "..";
import { hasErrors } from "./util";
import { Error } from "../../../../components/Editor/Field/FieldShell";
import { withAI } from "../../../../../../../../shell/components/withAi";
import { MutableRefObject } from "react";

const AIFieldShell = withAI(FieldShell);

type MetaDescriptionProps = {
  value: string;
  onChange: (value: string, name: string) => void;
  error: Error;
  onResetFlowType: () => void;
  aiButtonRef?: MutableRefObject<any>;
  isAIAssistedFlow: boolean;
  required: boolean;
};
export default connect()(function MetaDescription({
  value,
  onChange,
  error,
  onResetFlowType,
  aiButtonRef,
  isAIAssistedFlow,
  required,
}: MetaDescriptionProps) {
  return (
    <Box data-cy="metaDescription" id="metaDescription">
      <AIFieldShell
        ZUID="metaDescription"
        ref={aiButtonRef}
        settings={{
          label: "Meta Description",
          required,
        }}
        customTooltip="This description appears as text snippet below the title in search engine and social media previews. The ideal length for a meta description is 50 to 160 characters."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaDescription}
        valueLength={value?.length ?? 0}
        errors={error}
        aiType="description"
        name="metaDescription"
        value={value}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => {
          onChange(evt.target.value, "metaDescription");
          onResetFlowType?.();
        }}
        onResetFlowType={() => {
          onResetFlowType?.();
        }}
        isAIAssistedFlow={isAIAssistedFlow}
      >
        <TextField
          name="metaDescription"
          value={value}
          placeholder="This is the description search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaDescription")}
          multiline
          rows={3}
          error={hasErrors(error)}
        />
      </AIFieldShell>
    </Box>
  );
});
