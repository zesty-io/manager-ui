import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExternalLinkAlt,
  faMinus
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
    <tr className={styles.PlanStep}>
      <td>
        <Url href={``}>
          <FontAwesomeIcon icon={faEdit} />
        </Url>
      </td>
      <td>
        <Url href={``}>
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </Url>
      </td>

      <td>en-US</td>

      <td>
        <Select name="version" value={options[0].value}>
          {options.map(opt => (
            <Option value={opt.value} text={opt.text} />
          ))}
        </Select>
      </td>

      <td>content item title</td>

      <td>Last published version 00 on DATE by User Name</td>

      <td>
        <Button>
          <FontAwesomeIcon icon={faMinus} />
        </Button>
      </td>
    </tr>
  );
}
