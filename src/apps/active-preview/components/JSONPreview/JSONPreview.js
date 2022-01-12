import { useEffect, useState } from "react";
import ReactJson from "react-json-view";

import styles from "./JSONPreview.less";
export function JSONPreview(props) {
  const [json, setJson] = useState({});

  useEffect(() => {
    fetch(props.src)
      .then((response) => response.json())
      .then((data) => setJson(data));
  }, [props.src]);

  return (
    <div className={styles.JSONPreview}>
      <ReactJson src={json} />
    </div>
  );
}
