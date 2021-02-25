import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { getUserLogs } from "shell/store/user";

import styles from "./UserLatestEdits.less";

export const UserLatestEdits = connect(state => state)(function UserLatestEdits(
  props
) {
  const [loading, setLoading] = useState(true);
  /*
  enumeraton
  Create Action = 1 + iota
	Update
	Delete
	Publish
	Unpublish
	UndoDelete
  */
  const limitEdit = 5;
  const actionUpdate = 2;
  useEffect(() => {
    props
      .dispatch(getUserLogs(props.user.ZUID, limitEdit, actionUpdate))
      .then(() => {
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        props.dispatch(
          notify({
            kind: "warn",
            message: "Failed to load User Logs"
          })
        );
      });
  }, []);

  //TESTING
  console.log("PROPS:", props);
  console.log(" PROPS LATEST EDITS:", props.user.latest_edits);

  return (
    <WithLoader condition={!loading} message="Loading UserLatestEdits">
      <Card className={styles.UserLatestEdits}>
        <CardHeader>Your Latest Edits</CardHeader>
        <CardContent className={styles.CardContent}>
          {props.user.latest_edits.map((item, i) => (
            <div key={i}>
              <hgroup>
                <h4>{`${item.meta.message}`}</h4>
                <h5>{`Updated: ${moment(item.updatedAt).fromNow()}`}</h5>
              </hgroup>
              <AppLink
                to={`/content/${item.meta.message
                  .split(" ")
                  .slice(-1)
                  .join("")
                  .replaceAll('"', "")
                  .replaceAll(/`/g, "")}/${item.affectedZUID}`}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </AppLink>
            </div>
          ))}
        </CardContent>
      </Card>
    </WithLoader>
  );
});
