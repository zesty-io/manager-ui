import React from "react";
import { actions } from "shell/store/ui";
import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";

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
    <aside
      data-cy="ActionsContent"
      className={cx(
        styles.Drawer,
        !ui.contentActions ? styles.DrawerClose : ""
      )}
    >
      <Button
        className={styles.ActionsDrawerButton}
        data-cy="ActionsButton"
        title="Open for additional file information"
        onClick={() => {
          dispatch(actions.setContentActions(!ui.contentActions));
        }}
      >
        {ui.contentActions ? (
          <FontAwesomeIcon icon={faChevronRight} />
        ) : (
          <FontAwesomeIcon icon={faChevronLeft} />
        )}
      </Button>

      <Actions
        {...props}
        site={{}}
        set={{
          type: props.model.type,
        }}
      />
    </aside>
  );
}
