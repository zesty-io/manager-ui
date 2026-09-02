import React, { useState } from "react";
import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";

import { Select, Option } from "shell/components/legacy/Select";

import styles from "./FieldTypeInternalLink.less";
export const FieldTypeInternalLink = React.memo(function FieldTypeInternalLink(
  props
) {
  const { t } = useTranslation();
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
        value={props.value && props.value !== "0" ? props.value : null}
        onSelect={(value, name) => {
          props.onChange(value ? value : null, name);
        }}
        onFilter={onSearch}
        // always render search input
        searchPlaceholder={t("shell.internalLinkSearchPlaceholder")}
        searchLength="0"
        loading={loading}
        error={props.error}
      >
        {/* You should always be able to unlink an internal link */}
        <Option
          value={props.defaultOptValue || null}
          text={props.defaultOptText || `— ${t("shell.internalLinkNone")} —`}
        />

        {props.options.map((option, i) => {
          return <Option key={i} {...option} />;
        })}
      </Select>
    </article>
  );
});
