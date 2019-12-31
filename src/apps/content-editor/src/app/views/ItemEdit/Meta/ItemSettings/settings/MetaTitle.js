import React from "react";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./MetaTitle.less";
export const MetaTitle = React.memo(function MetaTitle({
  meta_title,
  onChange
}) {
  return (
    <article className={styles.MetaTitle} data-cy="metaTitle">
      <FieldTypeText
        name="metaTitle"
        label={
          <label>
            <Infotip title="This is the title search engines should use in their results. The maximum amount of characters search engines show is 65 characters, but your title can be longer." />
            &nbsp;Meta Title
          </label>
        }
        value={meta_title}
        placeholder="This is the title search engines should use in their results"
        onChange={onChange}
      />
    </article>
  );
});
