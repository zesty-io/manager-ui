import { useSelector } from "react-redux";
import cx from "classnames";

import { Editor } from "../../../components/Editor";
import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { PreviewMode } from "../../../components/Editor/PreviewMode";
import { ActionsDrawer } from "./ActionsDrawer";

import styles from "./Content.less";
import { createSelector } from "reselect";
export default function Content(props) {
  // const ui = useSelector((state) => state.ui);
  const contentActions = createSelector(
    (state) => state.ui,
    (ui) => ui.contentActions
  );
  const duoMode = createSelector(
    (state) => state.ui,
    (ui) => ui.duoMode
  );

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

      <div
        className={cx(
          styles.MainEditor,
          contentActions ? styles.ContentActionsOn : "",
          duoMode ? styles.DuoModeOn : "",
          duoMode && contentActions ? styles.DuoAndActionsOn : ""
        )}
      >
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

        {duoMode && (
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
