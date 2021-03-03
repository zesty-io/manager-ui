import React, { useEffect, useState } from "react";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./UserLatest.less";

export function UserLatest(props) {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const user = props.user;
    setUser(user);
  }, [props.user]);

  return (
    <>
      <Card className={styles.UserLatestEdits}>
        <CardHeader>{props.cardTitle}</CardHeader>
        <CardContent className={styles.CardContent}>
          {user.slice(0, 5).map((item, i) => (
            <div key={i}>
              <AppLink
                to={`/content/${item.meta.message
                  .split(" ")
                  .slice(-1)
                  .join("")
                  .replaceAll('"', "")
                  .replaceAll(/`/g, "")}/${item.affectedZUID}`}
              >
                {/* <FontAwesomeIcon icon={faLink} /> */}
                <h4>{`${item.meta.message}`}</h4>
              </AppLink>
              <h5>{`Updated: ${moment(item.updatedAt).fromNow()}`}</h5>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
