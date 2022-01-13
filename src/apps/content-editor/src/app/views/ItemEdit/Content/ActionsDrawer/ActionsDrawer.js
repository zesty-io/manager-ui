import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { actions } from "shell/store/ui";

import { Button } from "@zesty-io/core";
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
  faChevronLeft,
  faChevronRight,
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
      className={cx(
        styles.Drawer,
        ui.contentActionsHover && !ui.contentActions ? styles.DrawerHover : "",
        ui.contentActions ? styles.DrawerLock : ""
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-cy="ActionsContent"
    >
      <nav
        className={
          ui.contentActionsHover || ui.contentActions ? styles.Hide : ""
        }
      >
        <ul>
          {icons.map((i) => {
            return (
              <li
                className={cx(
                  styles.QuickBar,
                  ui.contentActionsHover || ui.contentActions
                    ? styles.IconsHover
                    : ""
                )}
              >
                <FontAwesomeIcon icon={i} />
              </li>
            );
          })}
        </ul>
      </nav>
      <div
        className={cx(
          styles.ActionsContent,
          ui.contentActionsHover || ui.contentActions
            ? styles.ActionsDisplay
            : ""
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

      <div className={styles.Spacer}></div>
      <Button
        className={cx(
          styles.ActionsDrawerButton,
          ui.contentActionsHover || ui.contentActions
            ? styles.ActionsDrawerButtonHover
            : ""
        )}
        data-cy="ActionsButton"
        title="Open for additional file information"
        onClick={() => {
          dispatch(actions.setContentActions(!ui.contentActions));
        }}
      >
        {ui.contentActions || ui.contentActionsHover ? (
          <FontAwesomeIcon icon={faChevronRight} />
        ) : (
          <FontAwesomeIcon icon={faChevronLeft} />
        )}
      </Button>
    </aside>
  );
}
