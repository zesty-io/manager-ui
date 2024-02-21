import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";

import { ItemSettings } from "./ItemSettings";
import { DataSettings } from "./ItemSettings/DataSettings";

import styles from "./Meta.less";
export function Meta(props) {
  return (
    <section className={styles.MetaEdit}>
      <div className={styles.MetaWrap}>
        {props.model && props.model?.type === "dataset" ? (
          <DataSettings item={props.item} dispatch={props.dispatch} />
        ) : (
          <ItemSettings
            instance={props.instance}
            modelZUID={props.modelZUID}
            item={props.item}
            content={props.items}
            dispatch={props.dispatch}
            saving={props.saving}
          />
        )}
      </div>
    </section>
  );
}
