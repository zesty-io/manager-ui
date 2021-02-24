import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { WithLoader } from "@zesty-io/core/WithLoader";
import cx from "classnames";
import { getUserLogs, logUserEdits } from "shell/store/user";
import styles from "./UserLatestEdits.less";

export const UserLatestEdits = connect(state => state)(function UserLatestEdits(
  props
) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .dispatch(getUserLogs(props.user.ZUID))
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: "Failed to load UserLogs logs"
          })
        );
      });
  }, []);

  console.log("PROPS:", props);

  return (
    <WithLoader condition={!loading} message="Loading UserLatestEdits">
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
    </WithLoader>
  );
});
