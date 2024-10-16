import { memo, useState } from "react";

import { TextField, Select, MenuItem, Autocomplete } from "@mui/material";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";

const CANONICAL_OPTS = [
  {
    value: 0,
    label: "Off",
  },
  {
    value: 1,
    label: "On (Ignores query parameters)",
  },
  {
    value: 2,
    label: "On - Allow certain parameters",
  },
  {
    value: 3,
    label: "On - Custom Path or Custom URL",
  },
];

import styles from "./CanonicalTag.less";
export const CanonicalTag = memo(function CanonicalTag(props) {
  const [whitelist, setWhitelist] = useState(props.whitelist);
  const [custom, setCustom] = useState(props.custom);
  const [mode, setMode] = useState(
    props.mode || props.mode == 0 ? props.mode : 1
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
          label: "Canonical Tag",
        }}
        customTooltip="Canonical tags help search engines understand authoritative links and can help prevent duplicate content issues. Zesty.io auto-creates tags on demand based on your settings."
        withInteractiveTooltip={false}
      >
        {zestyStore.getState().instance.settings.seo[
          "canonical-tags-enabled"
        ] === "1" ? (
          <small className={`desc notEnabled`}>
            Canonical tags are not enabled. For more information, read
            <a
              href="https://developer.zesty.io/docs/seo-tools/canonical-tags/"
              target="_blank"
            >
              Enabling Canonical Tags
            </a>
          </small>
        ) : (
          <div className={styles.settings}>
            <Autocomplete
              options={CANONICAL_OPTS}
              value={CANONICAL_OPTS.find((option) => option.value === mode)}
              fullWidth
              renderInput={(params) => <TextField {...params} />}
              onChange={(_, value) => {
                handleMode(value ? value.value : 1, "canonicalTagMode");
              }}
            />

            {mode == "2" ? (
              <div className="setting-field custom">
                <label>Allowed query parameters (comma-separated)</label>
                <small className="desc">
                  Only list comma-separated parameter names. Do not include
                  values, ampersands, equals, or spaces.
                </small>
                <TextField
                  type="text"
                  name="canonicalQueryParamWhitelist"
                  value={whitelist}
                  onChange={handleWhitelist}
                  placeholder="page,category"
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
                <label>Custom Path Value or URL</label>
                <small className="desc">
                  For Custom Paths: begin with a forward slash. For Custom URL:
                  begin with http:// or https://
                </small>
                <TextField
                  type="text"
                  name="canonicalTagCustomValue"
                  value={custom}
                  onChange={handleCustom}
                  placeholder="/page/example/ or https://example.com/"
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
