import { Component } from "react";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";

export class ContentVelocity extends Component {
  render() {
    return (
      <Card>
        <CardHeader>
          <h2>
            <FontAwesomeIcon icon={faChartLine} />
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
