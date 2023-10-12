import React, { useState } from "react";
import debounce from "lodash/debounce";

import { Select, Option } from "@zesty-io/core/Select";

import styles from "./FieldTypeInternalLink.less";
export const FieldTypeInternalLink = React.memo(function FieldTypeInternalLink(
  props
) {
  const [loading, setLoading] = useState(false);

  const onSearch = debounce((term) => {
    if (term && props.onSearch) {
      setLoading(true);
      props.onSearch(term).then(() => {
        setLoading(false);
      });
    }
  }, 250);

  return (
    <article className={props.className}>
      <Select
        className={styles.FieldTypeInternalLink}
        style={{
          width: 100,
        }}
        name={props.name}
        placeholder={props.placeholder}
        value={props.value || "0"}
        onSelect={props.onChange}
        onFilter={onSearch}
        // always render search input
        searchPlaceholder="Do not see the item you are looking for? Enter a term to search your API."
        searchLength="0"
        loading={loading}
      >
        {/* You should always be able to unlink an internal link */}
        <Option
          value={props.defaultOptValue || "0"}
          text={props.defaultOptText || "— None —"}
        />

        {props.options.map((option, i) => {
          return <Option key={i} {...option} />;
        })}
      </Select>
    </article>
  );
});
