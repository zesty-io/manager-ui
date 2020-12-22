import React from "react";

import { Editor } from "../../../components/Editor";
import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";

import { Actions } from "./Actions";

import styles from "./Content.less";
export default function Content(props) {
  return (
    <main className={styles.Content}>
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

      <div className={styles.MainEditor}>
        <div className={styles.Editor}>
          <Editor
            // active={this.state.makeActive}
            // scrolled={() => this.setState({ makeActive: "" })}
            model={props.model}
            itemZUID={props.itemZUID}
            item={props.item}
            fields={props.fields}
            dispatch={props.dispatch}
            isDirty={props.item.dirty}
            onSave={props.onSave}
          />
        </div>
        <div className={styles.Actions}>
          <Actions
            {...props}
            site={{}}
            set={{
              type: props.model.type
            }}
          />
        </div>
      </div>
    </main>
  );
}
