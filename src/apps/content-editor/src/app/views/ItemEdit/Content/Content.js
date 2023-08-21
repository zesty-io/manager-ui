import { useSelector } from "react-redux";
import cx from "classnames";

import { Editor } from "../../../components/Editor";
import { Header2 } from "../components/ItemEditHeader";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import { ActionsDrawer } from "./ActionsDrawer";

import styles from "./Content.less";
export default function Content(props) {
  const ui = useSelector((state) => state.ui);

  return (
    <main className={styles.Content}>
      {/* <Header
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
      </Header> */}
      {/* <Header2 /> */}

      <div
        className={cx(
          styles.MainEditor,
          ui.contentActions ? styles.ContentActionsOn : "",
          ui.duoMode ? styles.DuoModeOn : "",
          ui.duoMode && ui.contentActions ? styles.DuoAndActionsOn : ""
        )}
      >
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
          modelZUID={props.modelZUID}
        />

        {ui.duoMode && (
          <PreviewMode
            dirty={props.item.dirty}
            version={props.item.meta.version}
          />
        )}

        <ActionsDrawer className={styles.Actions} {...props} />
      </div>
    </main>
  );
}
