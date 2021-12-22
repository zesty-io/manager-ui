import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { actions } from "shell/store/ui";

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
      className={cx(styles.Drawer)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cy="ActionsContent"
    >
      <div
        className={cx(
          ui.contentActionsHover && !ui.contentActions
            ? styles.Hide
            : styles.Show,
          ui.contentActions ? styles.Hide : ""
        )}
      >
        <ul className={styles.Quickbar}>
          <li>
            <FontAwesomeIcon icon={faChevronLeft} />
          </li>
          <li>
            <FontAwesomeIcon icon={faChevronLeft} />
          </li>
          <li>
            <FontAwesomeIcon icon={faChevronLeft} />
          </li>
          <li>
            <FontAwesomeIcon icon={faChevronLeft} />
          </li>
          <li>
            <FontAwesomeIcon icon={faChevronLeft} />
          </li>
        </ul>
      </div>
      <div
        className={cx(
          ui.contentActionsHover ? styles.DrawerHover : styles.Hide,
          ui.contentActions ? styles.DrawerAction : ""
        )}
      >
        <Actions
          {...props}
          site={{}}
          set={{
            type: props.model.type,
          }}
        />
      </div>
    </aside>
  );
}
