import { memo } from "react";

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
};
export const MetaTitle = memo(function MetaTitle({
  value,
  onChange,
  error,
}: MetaTitleProps) {
  return (
    <Box data-cy="metaTitle">
      <AIFieldShell
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
