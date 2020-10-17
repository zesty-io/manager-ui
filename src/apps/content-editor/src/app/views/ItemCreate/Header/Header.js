import React from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faAngleRight,
  faSpinner,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./Header.less";
export default connect(state => {
  return {
    platform: state.platform
  };
})(function Header(props) {
  return (
    <header className={styles.Header}>
      <span>
        <AppLink to="/content">
          <FontAwesomeIcon icon={faHome} />
        </AppLink>
        <FontAwesomeIcon icon={faAngleRight} />
        <AppLink to={`/content/${props.model.ZUID}`}>
          {props.model.label}
        </AppLink>
        <FontAwesomeIcon icon={faAngleRight} />
        &nbsp;New Item
      </span>

      <ButtonGroup className={styles.Actions}>
        <Button
          kind="save"
          id="CreateItemSaveButton"
          disabled={props.saving || !props.isDirty}
          onClick={props.onSave}
        >
          {props.saving ? (
            <FontAwesomeIcon icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faSave} />
          )}
          Create Item&nbsp;
          <small>({props.platform.isMac ? "CMD" : "CTRL"} + S)</small>
        </Button>
      </ButtonGroup>
    </header>
  );
});
