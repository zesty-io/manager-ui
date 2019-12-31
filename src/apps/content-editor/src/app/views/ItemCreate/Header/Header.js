import React, { PureComponent, Fragment } from "react";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { Button } from "@zesty-io/core/Button";
import { Url } from "@zesty-io/core/Url";

import styles from "./Header.less";
export class Header extends PureComponent {
  render() {
    return (
      <header className={styles.Header}>
        <span>
          <Url href="#!/content/home">
            <i className="fas fa-tachometer-alt" aria-hidden="true" />
          </Url>
          <i className="fa fa-angle-right" />
          <Url href={`#!/content/${this.props.model.ZUID}`}>
            {this.props.model.label}
          </Url>
          <i className="fa fa-angle-right" />
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
              <i className="fa fa-spinner" aria-hidden="true" />
            ) : (
              <i className="fas fa-save" aria-hidden="true" />
            )}
            Create New Item&nbsp;
            <small>({this.props.OS === "win" ? "CTRL" : "CMD"} + S)</small>
          </Button>
        </ButtonGroup>
      </header>
    );
  }
}
