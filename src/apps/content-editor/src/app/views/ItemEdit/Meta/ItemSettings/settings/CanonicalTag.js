import React, { useState } from "react";
import { Select, Option } from "@zesty-io/core/Select";
import { Input } from "@zesty-io/core/Input";

const CANONICAL_OPTS = [
  {
    value: 0,
    text: "Off"
  },
  {
    value: 1,
    text: "On (Ignores query parameters)"
  },
  {
    value: 2,
    text: "On - Allow certain parameters"
  },
  {
    value: 3,
    text: "On - Custom Path or Custom URL"
  }
];

import styles from "./CanonicalTag.less";
export const CanonicalTag = React.memo(function CanonicalTag(props) {
  const [whitelist, setWhitelist] = useState(props.whitelist);
  const [custom, setCustom] = useState(props.custom);
  const [mode, setMode] = useState(
    props.mode || props.mode == 0 ? props.mode : 1
  );

  const handleMode = (name, value) => {
    setMode(value);
    props.onChange(name, Number(value));
  };

  const handleWhitelist = evt => {
    props.onChange(evt.target.name, evt.target.value);
    setWhitelist(evt.target.value);
  };

  const handleCustom = evt => {
    props.onChange(evt.target.name, evt.target.value);
    setCustom(evt.target.value);
  };

  return (
    <article className={styles.CanonicalTag} data-cy="canonicalTag">
      <label>
        <Infotip title="Canonical tags help search engines understand authoritative links and can help prevent duplicate content issues. Zesty.io auto creates tags on demand based on your settings." />
        &nbsp;Canonical Tag
      </label>
      {zesty.settings.seo["canonical-tags-enabled"] === "1" ? (
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
            onSelect={handleMode}
            value={CANONICAL_OPTS[mode] && CANONICAL_OPTS[mode].value}
            options={CANONICAL_OPTS}
          >
            {CANONICAL_OPTS.map(opt => (
              <Option key={opt.value} value={opt.value} text={opt.text} />
            ))}
          </Select>

          {mode == "2" ? (
            <div className="setting-field custom">
              <label>Allowed query parameters (comma-separated)</label>
              <small className="desc">
                Only list comma-separated parameter names. Do not include
                values, ampersands, equals, or spaces.
              </small>
              <Input
                type="text"
                name="canonicalQueryParamWhitelist"
                value={whitelist}
                className={styles.Input}
                onChange={handleWhitelist}
                placeholder="page,category"
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
              <Input
                type="text"
                name="canonicalTagCustomValue"
                value={custom}
                onChange={handleCustom}
                className={styles.Input}
                placeholder="/page/example/ or https://example.com/"
              />
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
});
