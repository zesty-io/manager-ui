import { useDispatch, useSelector } from "react-redux";
import cx from "classnames";

import { actions } from "shell/store/ui";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core";

import styles from "./ContentNavToggle.less";
export function ContentNavToggle() {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();

  return (
    <Button
      title={ui.contentNav ? "Close Content Nav" : "Open Content Nav"}
      data-cy="contentNavButton"
      className={cx(styles.ContentNavToggle)}
      onClick={() => {
        dispatch(actions.setContentNav(!ui.contentNav));
      }}
    >
      {ui.contentNav ? (
        <>
          <FontAwesomeIcon icon={faChevronLeft} />
          &nbsp;
          <FontAwesomeIcon icon={faLock} />
        </>
      ) : (
        <FontAwesomeIcon icon={faChevronRight} />
      )}
    </Button>
  );
}
