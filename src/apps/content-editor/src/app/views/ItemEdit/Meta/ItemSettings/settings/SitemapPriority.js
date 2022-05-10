import { memo } from "react";

import { Select, Option } from "@zesty-io/core/Select";
import { FieldLabel } from "@zesty-io/core/FieldLabel";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./SitemapPriority.less";
export const SitemapPriority = memo(function SitemapPriority(props) {
  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <FieldLabel
        name="sitemapPriority"
        label={
          <label>
            <Tooltip
              title="Sitemap priority helps search engines understand how often they should crawl pages on your site."
              arrow
              placement="top-start"
            >
              <InfoIcon fontSize="small" />
            </Tooltip>
            &nbsp;Sitemap Priority
          </label>
        }
      />
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
