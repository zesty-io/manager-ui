import React from "react";
import { actions } from "shell/store/ui";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";

import { Drawer, DrawerHandle, DrawerContent } from "@zesty-io/core/Drawer";
import { Button } from "@zesty-io/core";

import { Actions } from "../Actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./ActionsDrawer.less";

export default function ActionsDrawer(props) {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  return (
    <Drawer
      className={styles.Drawer}
      position="right"
      // offset="0px"
      offset="43px"
      width="20vw"
      open={ui.contentActions}
    >
      <DrawerHandle
        className={cx(
          styles.DrawerHandle,
          !ui.contentActions ? styles.DrawerHandleClose : ""
        )}
        onClick={() => {
          dispatch(actions.setContentActions(!ui.contentActions));
        }}
      >
        <Button
          data-cy="ActionsButton"
          title="Open for additional file information"
        >
          {ui.contentActions ? (
            <FontAwesomeIcon icon={faChevronRight} />
          ) : (
            <FontAwesomeIcon icon={faChevronLeft} />
          )}
        </Button>
      </DrawerHandle>
      <DrawerContent className={styles.DrawerContent}>
        {ui.contentActions && (
          <React.Fragment>
            <Actions
              {...props}
              site={{}}
              set={{
                type: props.model.type,
              }}
            />
            <div className={styles.DrawerHandlePlaceHolder}></div>
          </React.Fragment>
        )}
      </DrawerContent>
    </Drawer>
  );
}
