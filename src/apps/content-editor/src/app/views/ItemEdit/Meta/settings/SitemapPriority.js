import { memo } from "react";

import { Select, MenuItem } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import styles from "./SitemapPriority.less";

export const SitemapPriority = memo(function SitemapPriority(props) {
  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <FieldShell
        settings={{
          label: "Sitemap Priority",
        }}
        customTooltip="Sitemap priority helps search engines understand how often they should crawl pages on your site."
        withInteractiveTooltip={false}
      >
        <Select
          name="sitemapPriority"
          defaultValue={props.sitemapPriority || "-1.0"}
          size="small"
          onChange={(e) => {
            // this value is coerced here due to API restrictions
            props.onChange(Number(e.target.value), "sitemapPriority");
          }}
          fullWidth
        >
          <MenuItem value={-1.0}>Automatically Set Priority</MenuItem>
          <MenuItem value={1.0}>1.0</MenuItem>
          <MenuItem value={0.9}>0.9</MenuItem>
          <MenuItem value={0.8}>0.8</MenuItem>
          <MenuItem value={0.7}>0.7</MenuItem>
          <MenuItem value={0.6}>0.6</MenuItem>
          <MenuItem value={0.5}>0.5</MenuItem>
          <MenuItem value={0.4}>0.4</MenuItem>
          <MenuItem value={0.3}>0.3</MenuItem>
          <MenuItem value={0.2}>0.2</MenuItem>
          <MenuItem value={0.1}>0.1</MenuItem>
          <MenuItem value={-2.0}>Do Not Display in Sitemap</MenuItem>
        </Select>
      </FieldShell>
    </article>
  );
});
