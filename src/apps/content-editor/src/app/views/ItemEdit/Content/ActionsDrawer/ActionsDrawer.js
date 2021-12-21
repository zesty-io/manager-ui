import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { actions } from "shell/store/ui";

import { Button } from "@zesty-io/core";

import { Actions } from "../Actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./ActionsDrawer.less";

export default function ActionsDrawer(props) {
  const dispatch = useDispatch();
  const ui = useSelector((state) => state.ui);
  const [mouseEnterTimer, setMouseEnterTimer] = useState(null);
  const [mouseLeaveTimer, setMouseLeaveTimer] = useState(null);

  const handleMouseEnter = () => {
    const enterTimer = setTimeout(() => {
      dispatch(actions.setContentActionsHover(true));
    }, 500);

    setMouseEnterTimer(enterTimer);
  };

  const handleMouseLeave = () => {
    const leaveTimer = setTimeout(() => {
      dispatch(actions.setContentActionsHover(false));
    }, 500);
    setMouseLeaveTimer(leaveTimer);

    clearTimeout(mouseEnterTimer);
    clearTimeout(mouseLeaveTimer);
  };

  return (
    <aside
      className={cx(
        styles.Drawer,
        ui.contentActionsHover ? styles.DrawerHover : ""
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cy="ActionsContent"
    >
      <Actions
        {...props}
        site={{}}
        set={{
          type: props.model.type,
        }}
      />
      {/* <Button
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
      </Button> */}
    </aside>
  );
}
