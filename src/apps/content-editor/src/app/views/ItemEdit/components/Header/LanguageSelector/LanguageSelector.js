import { Fragment } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import { Select, MenuItem } from "@mui/material";

import { selectLang } from "shell/store/user";

export const LanguageSelector = connect((state, props) => {
  let siblings = {};
  let selectedLang = state.user.selected_lang || "en-US";

  if (props.itemZUID) {
    const item = state.content[props.itemZUID];

    siblings = item?.siblings || {};
    selectedLang = Object.keys(siblings).find(
      (code) => siblings[code] === props.itemZUID
    );
  }

  return {
    languages: state.languages,
    selectedLang,
    siblings,
  };
})((props) => {
  const location = useLocation();
  const history = useHistory();

  const handleSelect = (e) => {
    const val = e.target.value;
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
    <Fragment>
      {props.languages.length > 1 ? (
        <Select
          name="LanguageSelector"
          className={cx("LanguageSelector", props.className)}
          value={props.selectedLang}
          onChange={handleSelect}
          size="small"
          sx={{
            height: "32px",
          }}
        >
          {props.languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.code}
            </MenuItem>
          ))}
        </Select>
      ) : null}
    </Fragment>
  );
});
