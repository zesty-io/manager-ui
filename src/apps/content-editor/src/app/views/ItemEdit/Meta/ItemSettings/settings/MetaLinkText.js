import { memo, useEffect } from "react";

import { TextField } from "@mui/material";
import { FieldShell } from "../../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../ItemSettings";

import styles from "./MetaLinkText.less";
export const MetaLinkText = memo(function MetaLinkText({
  meta_link_text,
  onChange,
  errors,
  isSaving,
}) {
  useEffect(() => {
    if (isSaving) {
      onChange(meta_link_text, "metaLinkText");
    }
  }, [meta_link_text]);

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
        valueLength={meta_link_text?.length ?? 0}
        errors={errors?.metaLinkText ?? {}}
      >
        <TextField
          name="metaLinkText"
          value={meta_link_text}
          placeholder={"This text is used in application navigation"}
          onChange={(evt) => onChange(evt.target.value, "metaLinkText")}
        />
      </FieldShell>
    </article>
  );
});
