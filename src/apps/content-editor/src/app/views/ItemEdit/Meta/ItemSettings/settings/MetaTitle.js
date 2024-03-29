import { memo } from "react";

import { TextField } from "@mui/material";

import { FieldShell } from "../../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../ItemSettings";
import styles from "./MetaTitle.less";
export const MetaTitle = memo(function MetaTitle({
  meta_title,
  onChange,
  errors,
}) {
  return (
    <article className={styles.MetaTitle} data-cy="metaTitle">
      <FieldShell
        settings={{
          label: "Meta Title",
        }}
        customTooltip="This is the title search engines should use in their results. The maximum amount of characters search engines show is 65 characters, but your title can be longer."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaTitle}
        valueLength={meta_title?.length ?? 0}
        errors={errors?.metaTitle ?? {}}
      >
        <TextField
          name="metaTitle"
          value={meta_title}
          placeholder="This is the title search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaTitle")}
        />
      </FieldShell>
    </article>
  );
});
