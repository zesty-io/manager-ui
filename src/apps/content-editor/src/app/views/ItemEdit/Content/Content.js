import { toggleContentActions } from "shell/store/ui";
import { useDispatch, useSelector } from "react-redux";
import { Editor } from "../../../components/Editor";
import { Header } from "../components/Header";
import { ItemVersioning } from "../components/Header/ItemVersioning";
import { Drawer, DrawerContent } from "@zesty-io/core/Drawer";
import { Button } from "@zesty-io/core";

import { Actions } from "./Actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Content.less";
export default function Content(props) {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();

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
        <aside className={styles.Actions}>
          <Button
            data-cy="ActionsButton"
            className={styles.CollapseBtn}
            onClick={() => {
              dispatch(toggleContentActions());
            }}
          >
            {ui.contentActions ? (
              <FontAwesomeIcon icon={faChevronRight} />
            ) : (
              <FontAwesomeIcon icon={faChevronLeft} />
            )}
            Actions
          </Button>
          <Drawer
            className={styles.Drawer}
            position="right"
            offset="0px"
            width="20vw"
            // 100 - GlobalTopbar - Header - ActionsBtn - 16px
            height="calc(100vh - 54px - 75px - 40px - 16px)"
            open={ui.contentActions}
          >
            <DrawerContent className={styles.DrawerContent}>
              <Actions
                {...props}
                site={{}}
                set={{
                  type: props.model.type,
                }}
              />
            </DrawerContent>
          </Drawer>
        </aside>
      </div>
    </main>
  );
}
