import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { AppLink } from "@zesty-io/core/AppLink";
import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./RecentlyEdited.less";
export class RecentlyEdited extends React.Component {
  render() {
    return (
      <Card className={styles.Card}>
        <CardHeader>
          <h2>
            <FontAwesomeIcon icon={faClock} /> Recent Instance Edits
          </h2>
        </CardHeader>
        <CardContent>
          <WithLoader
            condition={!this.props.loading}
            message="Loading Recent Items"
          >
            {this.props.items.length ? (
              <ul>
                {this.props.items.map((item, i) => (
                  <li key={i}>
                    <AppLink
                      to={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                    >
                      {item.web.metaTitle ||
                        `Item without a Meta Title: ${item.meta.ZUID}`}
                    </AppLink>
                  </li>
                ))}
              </ul>
            ) : (
              "No recently edited items"
            )}
          </WithLoader>
        </CardContent>
      </Card>
    );
  }
}
