import { memo } from "react";

import { Autocomplete, TextField } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import styles from "./SitemapPriority.less";

const OPTIONS = [
  {
    value: -1.0,
    label: "Automatically Set Priority",
  },
  {
    value: 1.0,
    label: "1.0",
  },
  {
    value: 0.9,
    label: "0.9",
  },
  {
    value: 0.8,
    label: "0.8",
  },
  {
    value: 0.7,
    label: "0.7",
  },
  {
    value: 0.6,
    label: "0.6",
  },
  {
    value: 0.5,
    label: "0.5",
  },
  {
    value: 0.4,
    label: "0.4",
  },
  {
    value: 0.3,
    label: "0.3",
  },
  {
    value: 0.2,
    label: "0.2",
  },
  {
    value: 0.1,
    label: "0.1",
  },
  {
    value: -2.0,
    label: "Do Not Display in Sitemap",
  },
];

export const SitemapPriority = memo(function SitemapPriority(props) {
  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <FieldShell
        settings={{
          label: "Sitemap Priority",
        }}
        customTooltip="Sitemap priority helps search engines understand how often they should crawl the pages on your site."
        withInteractiveTooltip={false}
      >
        <Autocomplete
          options={OPTIONS}
          value={
            OPTIONS.find(
              (option) => option.value === props.sitemapPriority
            ) || {
              value: -1.0,
              label: "Automatically Set Priority",
            }
          }
          fullWidth
          renderInput={(params) => <TextField {...params} />}
          onChange={(_, value) => {
            props.onChange(value ? value.value : -1.0, "sitemapPriority");
          }}
        />
      </FieldShell>
    </article>
  );
});
