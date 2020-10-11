import React, { useState, useEffect } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import { Select, Option } from "@zesty-io/core/Select";

import { fetchLangauges } from "shell/store/languages";
import { selectLang } from "shell/store/user";

import styles from "./LanguageSelector.less";
export const LanguageSelector = connect((state, props) => {
  let siblings = {};
  let selectedLang = state.user.selected_lang || "en-US";

  if (props.itemZUID) {
    const item = state.content[props.itemZUID];

    siblings = item.siblings || {};
    selectedLang = Object.keys(siblings).find(
      code => siblings[code] === props.itemZUID
    );
  }

  return {
    languages: state.languages,
    selectedLang,
    siblings
  };
})(props => {
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!props.languages.length && !loading) {
      setLoading(true);
      props.dispatch(fetchLangauges("enabled")).then(() => setLoading(false));
    }
  });

  const handleSelect = val => {
    props.dispatch(selectLang(val));

    // If we are at a content item level then reload newly selected language item
    const parts = location.pathname.split("/");
    if (parts[3]) {
      const subpath = parts.slice(0, 3);
      subpath.push(props.siblings[val]);
      history.push(`${subpath.join("/")}`);
    }
  };

  return (
    <React.Fragment>
      {props.languages.length > 1 ? (
        <Select
          name="LanguageSelector"
          className={cx(styles.LanguageSelector, props.className)}
          value={props.selectedLang}
          onSelect={handleSelect}
          loading={loading}
        >
          {props.languages.map(lang => (
            <Option key={lang.code} text={lang.code} value={lang.code} />
          ))}
        </Select>
      ) : null}
    </React.Fragment>
  );
});
