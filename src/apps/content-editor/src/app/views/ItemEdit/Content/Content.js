import { Editor } from "../../../components/Editor";
import cx from "classnames";
import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { useSelector } from "react-redux";
import { ActionsDrawer } from "./ActionsDrawer";
import { Button } from "@zesty-io/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

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

        <ActionsDrawer className={styles.Actions} {...props} />

        <Button
          className={cx(
            styles.ActionsDrawerButton,
            ui.contentActionsHover && styles.ActionsDrawerButtonHover
          )}
          data-cy="ActionsButton"
          title="Open for additional file information"
          onClick={() => {
            dispatch(actions.setContentActions(!ui.contentActions));
          }}
        >
          {ui.contentActions ? (
            <FontAwesomeIcon icon={faChevronLeft} />
          ) : (
            <FontAwesomeIcon icon={faChevronRight} />
          )}
        </Button>
      </div>
    </main>
  );
}
