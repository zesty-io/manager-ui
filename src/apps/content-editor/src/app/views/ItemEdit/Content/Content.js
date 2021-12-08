import { Editor } from "../../../components/Editor";
import cx from "classnames";
import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { useSelector } from "react-redux";
import { ActionsDrawer } from "./ActionsDrawer";

import styles from "./Content.less";

export default function Content(props) {
  const ui = useSelector((state) => state.ui);
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
          ui.contentActions ? styles.contentActionsOn : ""
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
        <aside data-cy="ActionsContent" className={styles.Actions}>
          <ActionsDrawer {...props} />
        </aside>
      </div>
    </main>
  );
}
