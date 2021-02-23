import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { WithLoader } from "@zesty-io/core/WithLoader";
import cx from "classnames";
import styles from "./UserLatestEdits.less";

export function UserLatestEdits(props) {
  return (
    <Card>
      <CardHeader>Your Latest Edits</CardHeader>
      <CardContent>
        {/* <ul>
      {this.state.userRecentMessage.map((item, i) => (
        <li key={i}>
          <AppLink
            to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
          >
            {item.web.message
              ? `Title: ${item.meta.message}`
              : `Message: `}
          </AppLink>
        </li>
      ))}
    </ul> */}
      </CardContent>
    </Card>
  );
}
