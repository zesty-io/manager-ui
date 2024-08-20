import { memo } from "react";

import { TextField, Box } from "@mui/material";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../NewMeta";
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
  return (
    <Box data-cy="metaLinkText">
      <FieldShell
        settings={{
          label: "Navigation Link Text",
        }}
        customTooltip="The title of this item that appears in the Zesty navigation and programmatically generated navigation within the Parsley navigation() function."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaLinkText}
        valueLength={value?.length ?? 0}
        errors={error ?? {}}
      >
        <TextField
          name="metaLinkText"
          value={value}
          placeholder={"This text is used in application navigation"}
          onChange={(evt) => onChange(evt.target.value, "metaLinkText")}
        />
      </FieldShell>
    </Box>
  );
});
