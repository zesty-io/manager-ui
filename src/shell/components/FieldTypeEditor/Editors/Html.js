import React, { useEffect, useState } from "react";
import cx from "classnames";

import styles from "./Html.less";
import { html } from "js-beautify";
import { Controlled as CodeMirror } from "react-codemirror2";
require("codemirror/mode/htmlmixed/htmlmixed");

function parse(str = "") {
  const formated = html(str, {
    indent_size: 2,
  });

  return formated;
}

export function HtmlEditor(props) {
  const [parsed, setParsed] = useState(parse(props.value));

  // NOTE: Update parsed value when version changes
  useEffect(() => {
    setParsed(parse(props.value));
  }, [props.version]);

  return (
    <CodeMirror
      className={cx(styles.Html, props.error ? styles.hasError : "")}
      value={parsed}
      options={{
        autoCursor: false,
        mode: "htmlmixed",
        // theme: "material",
        lineNumbers: true,
        lineWrapping: true,
      }}
      onBeforeChange={(editor, data, value) => {
        setParsed(value.trim());
      }}
      onChange={(editor, data, value) => {
        if (props.onChange) {
          props.onChange(value.trim());
        }
      }}
    />
  );
}
