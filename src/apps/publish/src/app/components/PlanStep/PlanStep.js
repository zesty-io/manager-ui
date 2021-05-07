import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faMinus } from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";
import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";

import styles from "./PlanStep.less";
export function PlanStep(props) {
  return (
    <tr className={styles.PlanStep}>
      <td>
        <Url href={``}>
          <FontAwesomeIcon icon={faExternalLinkAlt} />
        </Url>
      </td>

      <td>en-US</td>

      <td>
        <Select name="version" value={{ value: "00" }}>
          <Option value="00">Version 00</Option>
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
