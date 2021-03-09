import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./ContentVelocity.less";
export class ContentVelocity extends React.Component {
  render() {
    return (
      <Card>
        <CardHeader>
          <h2>
            <span className={`${styles.icon} fa fa-line-chart`} />
            Content Velocity
          </h2>
        </CardHeader>
        <CardContent>
          <table>
            <tr>
              <td>Published Last 7 date</td>
              <td />
            </tr>
            <tr>
              <td>Published Last 30 date</td>
              <td />
            </tr>
            <tr>
              <td>Total Pageviews</td>
              <td />
            </tr>
          </table>
        </CardContent>
      </Card>
    );
  }
}
