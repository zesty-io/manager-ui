import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faChevronLeft } from "@fortawesome/free-solid-svg-icons";

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
          <FontAwesomeIcon icon={faChevronLeft} /> Add another field
        </Button>

        <AppLink
          to={`/content/${props.modelZUID}/new`}
          onClick={props.goToContent}
        >
          <Button kind="save">
            <FontAwesomeIcon icon={faCheck} /> I want to add content
          </Button>
        </AppLink>
      </div>
    </>
  );
}
