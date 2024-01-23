import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import debounce from "lodash/debounce";

import { Select, Option } from "@zesty-io/core/Select";
import { LinkOption } from "./LinkOption";

import styles from "./FieldTypeInternalLink.less";

const sortHTML = (a, b) => {
  const nameA = String(a.html) && String(a.html).toUpperCase(); // ignore upper and lowercase
  const nameB = String(b.html) && String(b.html).toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
};

export const FieldTypeInternalLink = React.memo(function FieldTypeInternalLink(
  props
) {
  const allItems = useSelector(
    (state) => state.content,
    (prevState, nextState) => {
      return Object.keys(prevState)?.length === Object.keys(nextState)?.length;
    }
  );
  const [loading, setLoading] = useState(false);

  const internalLinkRelatedItem = allItems[props.value];
  const internalLinkOptions = useMemo(() => {
    const options = Object.keys(allItems)
      .map((itemZUID) => {
        if (
          itemZUID.includes("new") && // exclude new items
          !allItems[itemZUID].meta.ZUID && // ensure the item has a zuid
          !allItems[itemZUID].web.pathPart && // exclude non-routeable items
          !allItems[itemZUID].meta.langID === props.langID // exclude non-relevant langs
        ) {
          return;
        }

        let item = allItems[itemZUID];
        let html = "";

        if (item.web.metaTitle) {
          html += `<strong style="display:block;font-weight:bold;">${item.web.metaTitle}</strong>`;
        } else {
          return {
            component: (
              <LinkOption
                modelZUID={item.meta.contentModelZUID}
                itemZUID={itemZUID}
              />
            ),
          };
        }

        if (item.web.path || item.web.pathPart) {
          html += `<small style="font-style:italic;">${
            item.web.path || item.web.pathPart
          }</small>`;
        }

        return {
          value: itemZUID,
          html: html,
        };
      })
      .sort(sortHTML);

    if (
      !internalLinkRelatedItem ||
      !internalLinkRelatedItem.meta ||
      !internalLinkRelatedItem.meta.ZUID
    ) {
      // insert placeholder
      options.unshift({
        value: props.value,
        html: `Selected item not found: ${props.value}`,
      });
    }

    return options;
  }, [internalLinkRelatedItem, Object.keys(allItems).length]);

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
        onSelect={(value) => {
          props.onChange(value);
        }}
        onFilter={onSearch}
        // always render search input
        searchPlaceholder="Do not see the item you are looking for? Enter a term to search your API."
        searchLength="0"
        loading={loading}
        error={props.error}
      >
        {/* You should always be able to unlink an internal link */}
        <Option
          value={props.defaultOptValue || "0"}
          text={props.defaultOptText || "— None —"}
        />

        {internalLinkOptions.map((option, i) => {
          return <Option key={i} {...option} />;
        })}
      </Select>
    </article>
  );
});
