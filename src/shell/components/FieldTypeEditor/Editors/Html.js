import React, { useEffect, useState } from "react";
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
      className={styles.Html}
      value={parsed}
      options={{
        autoCursor: false,
        mode: "htmlmixed",
        // theme: "material",
        lineNumbers: true,
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
