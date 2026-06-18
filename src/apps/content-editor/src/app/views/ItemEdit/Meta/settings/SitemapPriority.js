import { memo, useMemo } from "react";

import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import styles from "./SitemapPriority.less";

const OPTIONS = [
  {
    value: -1.0,
    labelKey: "content.itemEditMetaSitemapAutomaticallySetPriority",
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
    labelKey: "content.itemEditMetaSitemapDoNotDisplay",
  },
];

export const SitemapPriority = memo(function SitemapPriority(props) {
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      OPTIONS.map((option) => ({
        ...option,
        label: option.label ?? t(option.labelKey),
      })),
    [t]
  );

  return (
    <article className={styles.SitemapPriority} data-cy="sitemapPriority">
      <FieldShell
        settings={{
          label: t("content.itemEditMetaSitemapPriority"),
        }}
        customTooltip={t("content.itemEditMetaSitemapPriorityTooltip")}
        withInteractiveTooltip={false}
      >
        <Autocomplete
          options={options}
          value={
            options.find((option) => option.value === props.sitemapPriority) ||
            options[0]
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
