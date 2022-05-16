import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";
import { actions } from "shell/store/ui";

import Button from "@mui/material/Button";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

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
      className={cx(
        styles.Drawer,
        ui.contentActionsHover && !ui.contentActions ? styles.DrawerOpen : "",
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
          {icons.map((i, index) => {
            return (
              <li
                key={index}
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
        variant="contained"
        data-cy="ActionsButton"
        title="Open for additional file information"
        onClick={() => {
          dispatch(actions.setContentActions(!ui.contentActions));
        }}
        sx={{
          position: "sticky",
          bottom: "0",
          borderRadius: "0",
          padding: "13px 6px",
          minWidth: "initial",
          zIndex: "1",
          boxShadow: " 2px 2px 5px fade(primary, 50%)",
          "&:hover": {
            color: "warning.main",
          },
        }}
      >
        {ui.contentActions || ui.contentActionsHover ? (
          <ChevronRightIcon />
        ) : (
          <ChevronLeftIcon />
        )}
      </Button>
    </aside>
  );
}
