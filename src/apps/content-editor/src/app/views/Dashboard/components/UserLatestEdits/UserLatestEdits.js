import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";
import cx from "classnames";
import { getUserLogs } from "shell/store/user";
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
            message: "Failed to load User Logs logs"
          })
        );
      });
  }, []);
  //TESTING
  console.log("PROPS:", props);
  console.log("MY PROPS:", props.user.latest_edits);

  return (
    <WithLoader condition={!loading} message="Loading UserLatestEdits">
      <Card>
        <CardHeader>Your Latest Edits</CardHeader>
        <CardContent>
          <ul>
            {props.user.latest_edits.map((item, i) => (
              <li key={i}>
                <p>{`User: ${item.firstName} Updated At: ${item.updatedAt}`}</p>
                <AppLink
                  to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </AppLink>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </WithLoader>
  );
});
