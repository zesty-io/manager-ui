import React, { PureComponent, Fragment } from "react";

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
export class Header extends PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <span>
          <Url href="/content/home">
            <FontAwesomeIcon icon={faTachometerAlt} />
          </Url>
          <FontAwesomeIcon icon={faAngleRight} />
          <Url href={`/content/${this.props.model.ZUID}`}>
            {this.props.model.label}
          </Url>
          <FontAwesomeIcon icon={faAngleRight} />
          &nbsp;New Item
        </span>

        <ButtonGroup className={styles.Actions}>
          <Button
            kind="save"
            id="CreateItemSaveButton"
            disabled={this.props.saving || !this.props.isDirty}
            onClick={this.props.onSave}
          >
            {this.props.saving ? (
              <FontAwesomeIcon icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            Create New Item&nbsp;
            <small>({this.props.OS === "win" ? "CTRL" : "CMD"} + S)</small>
          </Button>
        </ButtonGroup>
      </header>
    );
  }
}
