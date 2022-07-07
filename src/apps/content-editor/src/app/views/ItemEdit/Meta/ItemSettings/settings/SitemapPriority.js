import { memo } from "react";

import { Tooltip, Select, MenuItem, FormLabel } from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";

import styles from "./SitemapPriority.less";
export const SitemapPriority = memo(function SitemapPriority(props) {
  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <FormLabel name="sitemapPriority">
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
      </FormLabel>
      <Select
        name="sitemapPriority"
        defaultValue={props.sitemapPriority || "-1.0"}
        size="small"
        onSelect={(e) => {
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
    </article>
  );
});
