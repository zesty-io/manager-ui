import { memo, useState } from "react";

import { TextField, Tooltip, Select, MenuItem } from "@mui/material";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import FormLabel from "@mui/material/FormLabel";

const CANONICAL_OPTS = [
  {
    value: 0,
    text: "Off",
  },
  {
    value: 1,
    text: "On (Ignores query parameters)",
  },
  {
    value: 2,
    text: "On - Allow certain parameters",
  },
  {
    value: 3,
    text: "On - Custom Path or Custom URL",
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
      <FormLabel name="canonicaltag">
        <label>
          <Tooltip
            title="Canonical tags help search engines understand authoritative links and can help prevent duplicate content issues. Zesty.io auto creates tags on demand based on your settings."
            arrow
            placement="top-start"
          >
            <InfoIcon fontSize="small" />
          </Tooltip>
          &nbsp;Canonical Tag
        </label>
      </FormLabel>
      {zestyStore.getState().instance.settings.seo["canonical-tags-enabled"] ===
      "1" ? (
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
          <Select
            name="canonicalTagMode"
            onChange={(evt) => handleMode(evt.target.value, "canonicalTagMode")}
            value={CANONICAL_OPTS[mode] && CANONICAL_OPTS[mode].value}
            size="small"
            fullWidth
          >
            {CANONICAL_OPTS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.text}
              </MenuItem>
            ))}
          </Select>

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
    </article>
  );
});
