import React from "react";
import cx from "classnames";

import { Button } from "@zesty-io/core/Button";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./FieldSuccess.less";
export function FieldSuccess(props) {
  return (
    <>
      <h2 className={cx(styles.display, styles.Title)}>
        You've successfully added a field to {props.modelLabel}
      </h2>

      <div className={styles.SuccessButtons}>
        <Button kind="secondary" onClick={props.handleAddField}>
          <i className="fa fa-chevron-left" /> Add another field
        </Button>

        <AppLink
          to={`/content/${props.modelZUID}/new`}
          onClick={props.goToContent}
        >
          <Button kind="save">
            <i className="fa fa-check" /> I want to add content
          </Button>
        </AppLink>
      </div>
    </>
  );
}
