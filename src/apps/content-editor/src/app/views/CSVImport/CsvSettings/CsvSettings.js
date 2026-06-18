import { Component } from "react";
import { useTranslation } from "react-i18next";

import { Select, MenuItem, TextField } from "@mui/material";

import styles from "./CsvSettings.less";
export const CsvSettings = (props) => {
  const { t } = useTranslation();
  return (
    <section className={styles.CsvSettings}>
      <article className={styles.Setting}>
        <label>{t("content.itemEditMetaDescription")}</label>
        <Select
          name={"metaDescription"}
          onChange={(evt) =>
            props.handleMap(evt.target.value, "metaDescription")
          }
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>{t("content.itemEditMetaKeywords")}</label>
        <Select
          name="metaKeywords"
          onChange={(evt) => props.handleMap(evt.target.value, "metaKeywords")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>{t("content.csvSettingsMetaLinkText")}</label>
        <Select
          name="metaLinkText"
          onChange={(evt) => props.handleMap(evt.target.value, "metaLinkText")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>{t("content.itemEditMetaTitle")}</label>
        <Select
          name="metaTitle"
          onChange={(evt) => props.handleMap(evt.target.value, "metaTitle")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>{t("content.csvSettingsParentZuid")}</label>
        <Select
          name="parentZUID"
          onChange={(evt) => props.handleMap(evt.target.value, "parentZUID")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <label>{t("content.csvSettingsPathPart")}</label>
        <Select
          name="pathPart"
          onChange={(evt) => props.handleMap(evt.target.value, "pathPart")}
          defaultValue="none"
          size="small"
          fullWidth
        >
          <MenuItem value="none">{t("content.csvImportNone")}</MenuItem>
          {props.cols.map((col, index) => (
            <MenuItem key={index} value={col}>
              {col}
            </MenuItem>
          ))}
        </Select>
      </article>
      <article className={styles.Setting}>
        <CanonicalTag
          name="canonicalTagMode"
          onChange={props.handleMap}
          t={t}
        />
      </article>
      <article className={styles.Setting}>
        <label>{t("content.itemEditMetaSitemapPriority")}</label>
        <Select
          name="sitemapPriority"
          onChange={(evt) =>
            props.handleMap(evt.target.value, "sitemapPriority")
          }
          defaultValue={-1.0}
          size="small"
          fullWidth
        >
          <MenuItem value={-1.0}>
            {t("content.csvSettingsAutoPriority")}
          </MenuItem>
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
          <MenuItem value={-2.0}>{t("content.csvSettingsNoSitemap")}</MenuItem>
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
        textKey: "content.csvSettingsCanonicalOff",
      },
      {
        key: 1,
        value: 1,
        textKey: "content.csvSettingsCanonicalOnIgnore",
      },
      {
        key: 2,
        value: 2,
        textKey: "content.csvSettingsCanonicalOnAllow",
      },
      {
        key: 3,
        value: 3,
        textKey: "content.csvSettingsCanonicalOnCustom",
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
    const { t } = this.props;
    return (
      <article className={{ display: "flex" }}>
        <label>{t("content.itemEditMetaCanonicalTag")}</label>
        {zestyStore.getState().instance.settings.seo[
          "canonical-tags-enabled"
        ] === "1" ? (
          <small className={`desc notEnabled`}>
            {t("content.csvSettingsCanonicalNotEnabled")}
            <a
              href="https://developer.zesty.io/docs/seo-tools/canonical-tags/"
              target="_blank"
            >
              {t("content.itemEditMetaCanonicalEnableDocsLink")}
            </a>
          </small>
        ) : (
          <div>
            <Select
              name="canonicalTagMode"
              size="small"
              fullWidth
              onChange={(evt) => {
                const value = evt.target.value;
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
                    {t(opt.textKey)}
                  </MenuItem>
                );
              })}
            </Select>

            {this.state.canonicalTagMode == "2" ? (
              <div className="setting-field custom">
                <label>{t("content.csvSettingsAllowedParams")}</label>
                <small className="desc">
                  {t("content.csvSettingsAllowedParamsDesc")}
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
                <label>{t("content.csvSettingsCustomPathLabel")}</label>
                <small className="desc">
                  {t("content.csvSettingsCustomPathDesc")}
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
