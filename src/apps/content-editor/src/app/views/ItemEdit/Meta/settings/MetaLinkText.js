import { memo } from "react";

import { TextField } from "@mui/material";
import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../NewMeta";

import styles from "./MetaLinkText.less";
export const MetaLinkText = memo(function MetaLinkText({
  value,
  onChange,
  errors,
}) {
  return (
    <article className={styles.MetaLinkText} data-cy="metaLinkText">
      <FieldShell
        settings={{
          label: "Navigation Link Text",
        }}
        customTooltip="The meta link text is used in the content editor navigation and
          programmatically generated navigation with the Parsley 'navigation()'
          function."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaLinkText}
        valueLength={value?.length ?? 0}
        errors={errors?.metaLinkText ?? {}}
      >
        <TextField
          name="metaLinkText"
          value={value}
          placeholder={"This text is used in application navigation"}
          onChange={(evt) => onChange(evt.target.value, "metaLinkText")}
        />
      </FieldShell>
    </article>
  );
});
