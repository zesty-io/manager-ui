import React from "react";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { Url } from "@zesty-io/core/Url";
import { WithLoader } from "@zesty-io/core/WithLoader";

import styles from "./RecentlyEdited.less";
export class RecentlyEdited extends React.Component {
  render() {
    return (
      <Card className={styles.Card}>
        <CardHeader>
          <h2>
            <span className="fa fa-clock" /> Recent Instance Edits
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
                    <Url
                      href={`/content/${item.meta.contentModelZUID}/${item.meta.ZUID}`}
                    >
                      {item.web.metaTitle ||
                        `Item without a Meta Title: ${item.meta.ZUID}`}
                    </Url>
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
