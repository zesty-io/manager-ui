import { Component } from "react";

import { Select, MenuItem, TextField } from "@mui/material";

import styles from "./CsvSettings.less";
export const CsvSettings = (props) => {
  return (
    <section className={styles.CsvSettings}>
      <article className={styles.Setting}>
        <label>Meta Description</label>
        <Select
          name={"metaDescription"}
          onChange={(e) => props.handleMap(e.target.value, "metaDescription")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>Meta Keywords</label>
        <Select
          name="metaKeywords"
          onChange={(e) => props.handleMap(e.target.value, "metaKeywords")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>Meta Link Text</label>
        <Select
          name="metaLinkText"
          onChange={(e) => props.handleMap(e.target.value, "metaLinkText")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>Meta Title</label>
        <Select
          name="metaTitle"
          onChange={(e) => props.handleMap(e.target.value, "metaTitle")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>Parent ZUID</label>
        <Select
          name="parentZUID"
          onChange={(e) => props.handleMap(e.target.value, "parentZUID")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>Path Part</label>
        <Select
          name="pathPart"
          onChange={(e) => props.handleMap(e.target.value, "pathPart")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">none</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <CanonicalTag name="canonicalTagMode" onChange={props.handleMap} />
      </article>
      <article className={styles.Setting}>
        <label>Sitemap Priority</label>
        <Select
          name="sitemapPriority"
          onChange={(e) => props.handleMap(e.target.value, "sitemapPriority")}
          defaultValue={-1.0}
          size="small"
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
    </section>
  );
};

class CanonicalTag extends Component {
  state = {
    canonicalTagMode: 1,
    canonicalOptions: [
      {
        key: 0,
        value: 0,
        text: "Off",
      },
      {
        key: 1,
        value: 1,
        text: "On (Ignores query parameters)",
      },
      {
        key: 2,
        value: 2,
        text: "On - Allow certain parameters",
      },
      {
        key: 3,
        value: 3,
        text: "On - Custom Path or Custom URL",
      },
    ],
    whitelist: "",
    custom: "",
  };

  handleWhitelist = (evt) => {
    this.props.onChange(evt.target.value, evt.target.name);
    this.setState({
      whitelist: evt.target.value,
    });
  };

  handleCustom = (evt) => {
    //   basil.change_detected = true
    this.props.onChange(evt.target.value, evt.target.name);
    this.setState({
      custom: evt.target.value,
    });
  };

  render() {
    return (
      <article className={{ display: "flex" }}>
        <label>Canonical Tag</label>
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
          <div>
            <Select
              name="canonicalTagMode"
              size="small"
              fullWidth
              onChange={(e) => {
                const value = e.target.value;
                this.setState({ canonicalTagMode: value });
                this.props.onChange(Number(value), "canonicalTagMode");
              }}
              value={
                this.state.canonicalOptions[this.state.canonicalTagMode].value
              }
            >
              {this.state.canonicalOptions.map((opt) => {
                return (
                  <MenuItem key={opt.key} value={opt.value}>
                    {opt.text}
                  </MenuItem>
                );
              })}
            </Select>

            {this.state.canonicalTagMode == "2" ? (
              <div className="setting-field custom">
                <label>Allowed query parameters (comma-separated)</label>
                <small className="desc">
                  Only list comma-separated parameter names. Do not include
                  values, ampersands, equals, or spaces.
                </small>
                <TextField
                  type="text"
                  name="canonicalQueryParamWhitelist"
                  value={this.state.whitelist}
                  onChange={this.handleWhitelist}
                  placeholder="page,category"
                  size="small"
                  variant="outlined"
                  color="primary"
                  fullWidth
                />
              </div>
            ) : null}

            {this.state.canonicalTagMode == "3" ? (
              <div className="setting-field custom">
                <label>Custom Path Value or URL</label>
                <small className="desc">
                  For Custom Paths: begin with a forward slash. For Custom URL:
                  begin with http:// or https://
                </small>
                <TextField
                  type="text"
                  name="canonicalTagCustomValue"
                  value={this.state.custom}
                  onChange={this.handleCustom}
                  placeholder="/page/example/ or https://example.com/"
                  size="small"
                  variant="outlined"
                  color="primary"
                  fullWidth
                />
              </div>
            ) : null}
          </div>
        )}
      </article>
    );
  }
}
