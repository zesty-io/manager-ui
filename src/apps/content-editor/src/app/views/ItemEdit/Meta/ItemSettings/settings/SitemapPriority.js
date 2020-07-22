import React from "react";

import { Select, Option } from "@zesty-io/core/Select";
import { Infotip } from "@zesty-io/core/Infotip";

import styles from "./SitemapPriority.less";
export const SitemapPriority = React.memo(function SitemapPriority(props) {
  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <label>
        <Infotip title="Sitemap priority helps search engines understand how often they should crawl pages on your site." />
        &nbsp;Sitemap Priority
      </label>
      <Select
        name="sitemapPriority"
        value={props.sitemapPriority || "-1.0"}
        onSelect={(value, name) => {
          // this value is coerced here due to API restrictions
          props.onChange(Number(value), name);
        }}
      >
        <Option value={-1.0} text="Automatically Set Priority" />
        <Option value={1.0} text="1.0" />
        <Option value={0.9} text="0.9" />
        <Option value={0.8} text="0.8" />
        <Option value={0.7} text="0.7" />
        <Option value={0.6} text="0.6" />
        <Option value={0.5} text="0.5" />
        <Option value={0.4} text="0.4" />
        <Option value={0.3} text="0.3" />
        <Option value={0.2} text="0.2" />
        <Option value={0.1} text="0.1" />
        <Option value={-2.0} text="Do Not Display in Sitemap" />
      </Select>
    </article>
  );
});
