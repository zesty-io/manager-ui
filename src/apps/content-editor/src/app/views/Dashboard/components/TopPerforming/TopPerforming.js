import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleUp } from "@fortawesome/free-solid-svg-icons";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { request } from "utility/request";

export class TopPerforming extends React.PureComponent {
  state = {
    headers: [],
    data: [],
    loading: true
  };

  componentDidMount() {
    this.getTopTenContent().then(json => {
      if (json && json.tableData) {
        // find the numbers that are long
        // truncate at 2 decimal places
        // this is highly dependant on the format
        // that the fetch returns ex: [[path, number, number, number], ...]
        const truncatedData = json.tableData.data.map(row => {
          return row.map(col => {
            // will not attempt conversion on a path
            if (Number(col)) {
              return Number(Math.round(col + "e" + 2) + "e-" + 2);
            } else {
              return col;
            }
          });
        });
        this.setState({
          headers: json.tableData.headers,
          data: truncatedData,
          loading: false
        });
      } else {
        this.setState({
          loading: false
        });
      }
    });
  }

  getTopTenContent() {
    return request(
      `${CONFIG.SERVICE_GOOGLE_ANALYTICS_READ}/?zuid=${this.props.instanceZUID}`,
      {
        method: "POST",
        credentials: "omit",
        headers: {
          "content-type": "plain/text"
        },
        body: JSON.stringify({
          gaRequest: {
            reportRequests: [
              {
                viewId: this.props.profileID,
                dateRanges: [{ startDate: "14daysAgo", endDate: "today" }],
                metrics: [
                  { expression: "ga:sessions" },
                  { expression: "ga:avgSessionDuration" },
                  { expression: "ga:bounceRate" }
                ],
                dimensions: [{ name: "ga:pagePath" }],
                orderBys: [
                  {
                    fieldName: "ga:sessions",
                    sortOrder: "DESCENDING"
                  }
                ],
                pageSize: 10
              }
            ]
          },
          type: "bar"
        })
      }
    );
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <h2>
            <FontAwesomeIcon icon={faArrowCircleUp} />
            Top Performing Content
          </h2>
        </CardHeader>
        <CardContent>
          <WithLoader
            condition={!this.state.loading}
            message="Loading Top Performing Content"
          >
            {this.state.headers.length && this.state.data.length ? (
              <table>
                <tr>
                  {this.state.headers.map(item => (
                    <th>{item}</th>
                  ))}
                </tr>
                {this.state.data.map(data => (
                  <tr>
                    {data.map(field => (
                      <td>{field}</td>
                    ))}
                  </tr>
                ))}
              </table>
            ) : (
              "No content performance data to display"
            )}
          </WithLoader>
        </CardContent>
      </Card>
    );
  }
}
