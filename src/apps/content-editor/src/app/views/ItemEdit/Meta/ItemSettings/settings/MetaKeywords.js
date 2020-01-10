import React from "react";

import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./MetaKeywords.less";
export const MetaKeywords = React.memo(function MetaKeywords({
  meta_keywords,
  onChange
}) {
  return (
    <article className={styles.MetaKeywords} data-cy="metaKeywords">
      <FieldTypeTextarea
        name="metaKeywords"
        label={
          <label>
            <Infotip title="Keywords are comma separated words or phrase that describe your page. In 2011 Google denounced keywords; keywords are only used against your page ranking. Use them with caution." />
            &nbsp;Meta Keywords
          </label>
        }
        value={meta_keywords}
        placeholder="comma, separated, keywords"
        maxLength="500"
        onChange={onChange}
      />
    </article>
  );
});
