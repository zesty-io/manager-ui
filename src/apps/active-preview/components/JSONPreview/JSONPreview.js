import { useEffect, useState } from "react";
import ReactJson from "react-json-view";

import styles from "./JSONPreview.less";
export function JSONPreview(props) {
  const [json, setJson] = useState({});

  useEffect(() => {
    const apiKey = props.settings.find(
      (setting) => setting.key === "basic_content_api_key" && setting.value
    );

    let headers = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey.value}`;
    }

    fetch(props.src, {
      headers,
    })
      .then((response) => response.json())
      .then((data) => setJson(data));
  }, [props.src]);

  return (
    <div className={styles.JSONPreview}>
      <ReactJson src={json} />
    </div>
  );
}
