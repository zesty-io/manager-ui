import { memo } from "react";

import { TextField } from "@mui/material";

import { FieldShell } from "../../../../../components/Editor/Field/FieldShell";
import styles from "./MetaKeywords.less";
export const MetaKeywords = memo(function MetaKeywords({
  meta_keywords,
  onChange,
}) {
  return (
    <article className={styles.MetaKeywords} data-cy="metaKeywords">
      <FieldShell
        settings={{
          label: "Meta Keywords",
        }}
        customTooltip="Keywords are comma separated words or phrase that describe your page. In 2011 Google denounced keywords; keywords are only used against your page ranking. Use them with caution."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={255}
        valueLength={meta_keywords?.length ?? 0}
      >
        <TextField
          name="metaKeywords"
          value={meta_keywords ?? ""}
          placeholder="comma, separated, keywords"
          rows={6}
          multiline
          onChange={(evt) => onChange(evt.target.value, "metaKeywords")}
        />
      </FieldShell>
    </article>
  );
});
