import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { Url } from "@zesty-io/core/Url";

import styles from "./WebEnginePreview.less";
export function WebEnginePreview(props) {
  let previewURL = `https://${props.instance.randomHashID}-dev.webengine.zesty.io${props.item.web.path}`;
  const highlight = (event) => event.target.select();
  return (
    <section className={styles.WebEngineWrap}>
      <Header
        instance={props.instance}
        modelZUID={props.modelZUID}
        model={props.model}
        itemZUID={props.itemZUID}
        item={props.item}
      ></Header>

      <div className={styles.bottomFrame}>
        <div className={styles.browserWrap}>
          <div className={styles.browserBar}>
            <span className={styles.label}>WebEngine Preview</span>
            <input
              className={styles.browserUrl}
              onClick={highlight}
              readOnly={true}
              value={previewURL}
            />
            <Url
              href={previewURL}
              className={styles.outboundLink}
              target="_blank"
            >
              Open in Browser New Tab
            </Url>
          </div>
          <iframe className={styles.previewFrame} src={previewURL}></iframe>
        </div>
      </div>
    </section>
  );
}
