import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";

import styles from "./WebEnginePreview.less";
export function WebEnginePreview(props) {
  return (
    <section className={styles.Preview}>
      <Header
        instance={props.instance}
        modelZUID={props.modelZUID}
        model={props.model}
        itemZUID={props.itemZUID}
        item={props.item}
      >
        <ItemVersioning
          instance={props.instance}
          modelZUID={props.modelZUID}
          itemZUID={props.itemZUID}
          item={props.item}
          user={props.user}
          saving={props.saving}
          onSave={props.onSave}
          dispatch={props.dispatch}
        />
      </Header>

      <div className={styles.MetaWrap}>PREVIEW</div>
    </section>
  );
}
