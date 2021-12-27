import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { actions } from "shell/store/ui";

import { Actions } from "../Actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faCodeBranch,
  faShareAlt,
  faSync,
  faTrash,
  faUnlink,
  faUserCheck,
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
        <ul className={styles.QuickBar}>
          <li>
            <FontAwesomeIcon icon={faCodeBranch} />
          </li>
          <li>
            <FontAwesomeIcon icon={faUserCheck} />
          </li>
          <li>
            <FontAwesomeIcon icon={faUserCheck} />
          </li>
          <li>
            <FontAwesomeIcon icon={faCode} />
          </li>
          <li>
            <FontAwesomeIcon icon={faShareAlt} />
          </li>
          <li>
            <FontAwesomeIcon icon={faSync} />
          </li>
          <li>
            <FontAwesomeIcon icon={faUnlink} />
          </li>
          <li>
            <FontAwesomeIcon icon={faTrash} />
          </li>
        </ul>
      </div>
      <div
        className={cx(
          ui.contentActionsHover && !ui.contentActions
            ? styles.DrawerHover
            : ui.contentActions
            ? styles.DrawerAction
            : styles.Hide
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
