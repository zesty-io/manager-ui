import { memo } from "react";

import { TextField } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { MaxLengths } from "../NewMeta";
import styles from "./MetaTitle.less";
import { hasErrors } from "./util";

export const MetaTitle = memo(function MetaTitle({ value, onChange, errors }) {
  return (
    <article className={styles.MetaTitle} data-cy="metaTitle">
      <FieldShell
        settings={{
          label: "Meta Title",
          required: true,
        }}
        customTooltip="This is the title search engines should use in their results. The maximum amount of characters search engines show is 65 characters, but your title can be longer."
        withInteractiveTooltip={false}
        withLengthCounter
        maxLength={MaxLengths.metaTitle}
        valueLength={value?.length ?? 0}
        errors={errors ?? {}}
      >
        <TextField
          name="metaTitle"
          value={value}
          placeholder="This is the title search engines should use in their results"
          onChange={(evt) => onChange(evt.target.value, "metaTitle")}
          error={hasErrors(errors)}
        />
      </FieldShell>
    </article>
  );
});
