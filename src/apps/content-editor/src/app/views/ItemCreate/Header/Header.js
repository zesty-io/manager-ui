import React from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faAngleRight,
  faSpinner,
  faSave
} from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./Header.less";
export default connect(state => {
  return {
    platform: state.platform
  };
})(function Header(props) {
  return (
    <header className={styles.Header}>
      <span>
        <Url href="/content/home">
          <FontAwesomeIcon icon={faTachometerAlt} />
        </Url>
        <FontAwesomeIcon icon={faAngleRight} />
        <Url href={`/content/${props.model.ZUID}`}>{props.model.label}</Url>
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
          Create New Item&nbsp;
          <small>({props.platform.isMac ? "CMD" : "CTRL"} + S)</small>
        </Button>
      </ButtonGroup>
    </header>
  );
});
