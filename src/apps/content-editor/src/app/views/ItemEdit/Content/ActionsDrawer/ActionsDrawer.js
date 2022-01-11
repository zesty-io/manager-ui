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
  const icons = [
    faCodeBranch,
    faUserCheck,
    faUserCheck,
    faCode,
    faShareAlt,
    faSync,
    faUnlink,
    faTrash,
  ];

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
          ui.contentActionsHover || ui.contentActions
            ? styles.Hide
            : styles.Show
        )}
      >
        <ul className={styles.QuickBar}>
          {icons.map((i) => {
            return (
              <li>
                <FontAwesomeIcon icon={i} />
              </li>
            );
          })}
        </ul>
      </div>
      <div
        className={cx(
          ui.contentActionsHover && !ui.contentActions
            ? styles.DrawerHover
            : styles.DrawerDefault
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
