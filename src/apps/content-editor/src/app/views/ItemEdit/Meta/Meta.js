import React from "react";

import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";

import { ItemSettings } from "./ItemSettings";
import { DataSettings } from "./ItemSettings/DataSettings";

import styles from "./Meta.less";
export function Meta(props) {
  return (
    <section className={styles.MetaEdit}>
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

      <div className={styles.MetaWrap}>
        {props.model && props.model.type === "dataset" ? (
          <DataSettings item={props.item} dispatch={props.dispatch} />
        ) : (
          <ItemSettings
            instance={props.instance}
            modelZUID={props.modelZUID}
            item={props.item}
            content={props.items}
            dispatch={props.dispatch}
          />
        )}
      </div>
    </section>
  );
}
