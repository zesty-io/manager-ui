import React from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faEdit,
  faEye,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";
import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";

import styles from "./PlanStep.less";
export function PlanStep(props) {
  const options = [
    {
      text: "Version 00",
      value: "00"
    }
  ];
  return (
    <tr className={cx(styles.bodyText, styles.PlanStep)}>
      <td>en-US</td>

      <td>
        {/* Update preview link when version is changed */}
        <Select name="version" value={options[0].value}>
          {options.map(opt => (
            <Option value={opt.value} text={opt.text} />
          ))}
        </Select>
      </td>

      <td>
        {/* Use icon matched to items model type */}
        <FontAwesomeIcon icon={faDatabase} />
        {/* Use meta title. Show warning with link to edit if meta title is missing. */}
        &nbsp;content item title
      </td>

      <td>Last publish was version 00 on DATE</td>

      <td className={styles.actions}>
        <Url href={``}>
          <FontAwesomeIcon icon={faEdit} />
        </Url>

        {/* Preview link should include specific selected version */}
        <Url href={``}>
          <FontAwesomeIcon icon={faEye} />
        </Url>

        <Button>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </td>
    </tr>
  );
}
