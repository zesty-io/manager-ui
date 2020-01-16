import React from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkSquareAlt } from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import styles from "./LinkCell.less";
export const LinkCell = function LinkCell(props) {
  if (props.value) {
    return (
      <span className={cx(props.className, styles.LinkCell)}>
        {props.value.length > 145 ? (
          <Url href={props.value} target="_blank">
            <span>
              <i
                className="fas fa-external-link-square-alt"
                aria-hidden="true"
              />
              &nbsp;
              {props.value && props.value.substr(0, 145)} &hellip;
            </span>
          </Url>
        ) : (
          <Url href={props.value} target="_blank">
            <span>
              <i
                className="fas fa-external-link-square-alt"
                aria-hidden="true"
              />
              &nbsp;
              {props.value}
            </span>
          </Url>
        )}
      </span>
    );
  } else {
    return (
      <span className={cx(props.className, styles.LinkCell, styles.Empty)}>
        <FontAwesomeIcon icon={faExternalLinkSquareAlt} />
      </span>
    );
  }
};
