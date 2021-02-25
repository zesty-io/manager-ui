import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { getUserPublished } from "shell/store/user";

import styles from "./UserLatestPublishes.less";

export const UserLatestPublishes = connect(state => state)(
  function UserLatestPublishes(props) {
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
    const actionUpdate = 4;
    useEffect(() => {
      props
        .dispatch(getUserPublished(props.user.ZUID, limitEdit, actionUpdate))
        .then(() => {
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          props.dispatch(
            notify({
              kind: "warn",
              message: "Failed to load User Logs "
            })
          );
        });
    }, []);

    return (
      <WithLoader condition={!loading} message="Loading UserLatestPublishes">
        <Card className={styles.UserLatestPublishes}>
          <CardHeader>Your Latest Publishes</CardHeader>
          <CardContent className={styles.CardContent}>
            {props.user.latest_publishes.map((item, i) => (
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
  }
);
