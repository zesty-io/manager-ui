import React from "react";

import { FieldTypeText } from "@zesty-io/core/FieldTypeText";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./MetaLinkText.less";
export const MetaLinkText = React.memo(function MetaLinkText({
  meta_link_text,
  onChange
}) {
  return (
    <article className={styles.MetaLinkText} data-cy="metaLinkText">
      <FieldTypeText
        name="metaLinkText"
        label={
          <label>
            <Infotip
              title="The meta link text is used in the content editor navigation and
          programmatically generated navigation with the Parsley 'navigation()'
          function."
            />
            &nbsp;Navigation Link Text
          </label>
        }
        value={meta_link_text}
        placeholder={"This text is used in application navigation"}
        onChange={onChange}
      />
    </article>
  );
});
