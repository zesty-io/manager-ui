import { memo, useMemo, useState } from "react";

import { TextField, Select, MenuItem, Autocomplete } from "@mui/material";
import { useTranslation } from "react-i18next";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";

const CANONICAL_OPTS = [
  {
    value: 0,
    labelKey: "content.itemEditMetaCanonicalOff",
  },
  {
    value: 1,
    labelKey: "content.itemEditMetaCanonicalOnIgnoreQuery",
  },
  {
    value: 2,
    labelKey: "content.itemEditMetaCanonicalOnAllowParameters",
  },
  {
    value: 3,
    labelKey: "content.itemEditMetaCanonicalOnCustomPath",
  },
];

import styles from "./CanonicalTag.less";
export const CanonicalTag = memo(function CanonicalTag(props) {
  const { t } = useTranslation();
  const [whitelist, setWhitelist] = useState(props.whitelist);
  const [custom, setCustom] = useState(props.custom);
  const [mode, setMode] = useState(
    props.mode || props.mode == 0 ? props.mode : 1
  );
  const canonicalOptions = useMemo(
    () =>
      CANONICAL_OPTS.map((option) => ({
        ...option,
        label: t(option.labelKey),
      })),
    [t]
  );

  const handleMode = (value, name) => {
    setMode(value);
    props.onChange(Number(value), name);
  };

  const handleWhitelist = (evt) => {
    props.onChange(evt.target.value, evt.target.name);
    setWhitelist(evt.target.value);
  };

  const handleCustom = (evt) => {
    props.onChange(evt.target.value, evt.target.name);
    setCustom(evt.target.value);
  };

  return (
    <article className={styles.CanonicalTag} data-cy="canonicalTag">
      <FieldShell
        settings={{
          label: t("content.itemEditMetaCanonicalTag"),
        }}
        customTooltip={t("content.itemEditMetaCanonicalTagTooltip")}
        withInteractiveTooltip={false}
      >
        {zestyStore.getState().instance.settings.seo[
          "canonical-tags-enabled"
        ] === "1" ? (
          <small className={`desc notEnabled`}>
            {t("content.itemEditMetaCanonicalNotEnabled")}{" "}
            <a
              href="https://developer.zesty.io/docs/seo-tools/canonical-tags/"
              target="_blank"
            >
              {t("content.itemEditMetaCanonicalEnableDocsLink")}
            </a>
          </small>
        ) : (
          <div className={styles.settings}>
            <Autocomplete
              options={canonicalOptions}
              value={canonicalOptions.find((option) => option.value === mode)}
              fullWidth
              renderInput={(params) => <TextField {...params} />}
              onChange={(_, value) => {
                handleMode(value ? value.value : 1, "canonicalTagMode");
              }}
            />

            {mode == "2" ? (
              <div className="setting-field custom">
                <label>
                  {t("content.itemEditMetaCanonicalAllowedParameters")}
                </label>
                <small className="desc">
                  {t(
                    "content.itemEditMetaCanonicalAllowedParametersDescription"
                  )}
                </small>
                <TextField
                  type="text"
                  name="canonicalQueryParamWhitelist"
                  value={whitelist}
                  onChange={handleWhitelist}
                  placeholder={t(
                    "content.itemEditMetaCanonicalAllowedParametersPlaceholder"
                  )}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                  fullWidth
                />
              </div>
            ) : null}

            {mode == "3" ? (
              <div className="setting-field custom">
                <label>{t("content.itemEditMetaCanonicalCustomPath")}</label>
                <small className="desc">
                  {t("content.itemEditMetaCanonicalCustomPathDescription")}
                </small>
                <TextField
                  type="text"
                  name="canonicalTagCustomValue"
                  value={custom}
                  onChange={handleCustom}
                  placeholder={t(
                    "content.itemEditMetaCanonicalCustomPathPlaceholder"
                  )}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ mt: 1 }}
                  fullWidth
                />
              </div>
            ) : null}
          </div>
        )}
      </FieldShell>
    </article>
  );
});
