import React, { useCallback, useEffect, useState } from "react";
import styles from "./Markdown.less";

export function MarkdownEditor(props) {
  // NOTE: controlled component
  const [value, setValue] = useState(props.value);
  const onInput = useCallback((evt) => {
    setValue(evt.target.value);

    // emit change to listeners
    props.onChange(evt.target.value);
  });

  // update value if the version changes
  useEffect(() => setValue(props.value), [props.version]);

  return (
    <textarea
      className={styles.Markdown}
      placeholder={props.placeholder}
      value={value}
      onInput={onInput}
      onSubmit={(evt) => evt.preventDefault()}
    />
  );
}
