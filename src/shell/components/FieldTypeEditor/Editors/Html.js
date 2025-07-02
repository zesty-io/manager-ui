import React, { useEffect, useState, useRef } from "react";
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
  const editor = useRef();
  const wrapper = useRef();
  const mounted = useRef(false);

  const [parsed, setParsed] = useState(parse(props.value));

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // NOTE: Update parsed value when version changes
  useEffect(() => {
    setParsed(parse(props.value));
  }, [props.version]);

  return (
    <CodeMirror
      ref={wrapper}
      className={cx(styles.Html, props.error ? styles.hasError : "")}
      value={parsed}
      options={{
        autoCursor: false,
        mode: "htmlmixed",
        // theme: "material",
        lineNumbers: true,
        lineWrapping: true,
        htmlMode: true,
      }}
      onBeforeChange={(editor, data, value) => {
        setParsed(value.trim());
      }}
      onChange={(editor, data, value) => {
        // Prevent firing onChange on first mount
        if (!mounted.current) return;

        console.log("onChange", value.trim());
        if (props.onChange) {
          props.onChange(value.trim());
        }
      }}
      // Fixes issue with React 18 where 2 editors are rendered
      editorDidMount={(_editor) => (editor.current = _editor)}
      editorWillUnmount={() => {
        if (editor.current) {
          editor.current.display.wrapper.remove();
        }

        if (wrapper.current) {
          wrapper.current.hydrated = false;
        }
      }}
    />
  );
}
