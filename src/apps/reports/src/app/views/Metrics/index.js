import { useEffect, useState, useMemo } from "react";
import cx from "classnames";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import TopReq from "./TopReq";

import { WithLoader } from "@zesty-io/core/WithLoader";

import { CopyButton } from "@zesty-io/material";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Link from "@mui/material/Link";

import styles from "./Metrics.less";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import { Pie, Bar } from "react-chartjs-2";
import { Notice } from "@zesty-io/core";

import {
  useGetUsageQuery,
  useGetRequestsQuery,
} from "../../../../../../shell/services/metrics";

/*
  Returns a date range representing the last N days
  The API returns data from 0:00 UTC on startDate thru 23:59 on endDate
*/
const getDates = (numDays) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const start = new Date();
  start.setDate(start.getDate() - numDays);

  return { start, end: yesterday };
};

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const floatWithCommas = (x) => {
  x = x.toFixed(2);
  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export default function Metrics() {
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const dates = useMemo(() => {
    return [start.toISOString(), end.toISOString()];
  }, [timePeriod]);

  const StartDisplay = start.toString().split(" ").slice(0, 3).join(" ");
  const EndDisplay = end.toString().split(" ").slice(0, 3).join(" ");

  const {
    data: usageData,
    isLoading: usageLoading,
    error: usageError,
  } = useGetUsageQuery(dates);
  const {
    data: requestData,
    isLoading: requestsLoading,
    error: requestError,
  } = useGetRequestsQuery(dates);

  const bodyProps = {
    usageData,
    requestData,
    StartDisplay,
    EndDisplay,
    timePeriod,
    requestError,
    usageError,
  };

  return (
    <>
      <section className={styles.MetricsHeader}>
        <ButtonGroup variant="contained">
          <Button
            title="Past Day"
            onClick={() => setTimePeriod(1)}
            disabled={timePeriod === 1}
          >
            Past day
          </Button>
          <Button
            title="Past Day Week"
            onClick={() => setTimePeriod(7)}
            disabled={timePeriod === 7}
          >
            Past 7 days
          </Button>
          <Button
            title="Past 30 Days"
            onClick={() => setTimePeriod(30)}
            disabled={timePeriod === 30}
          >
            Past 30 days
          </Button>
        </ButtonGroup>

        <h1 className={styles.subheadline}>Zesty.io Usage Report </h1>
      </section>

      <WithLoader
        width="100%"
        height="calc(100vh - 54px)"
        condition={!usageLoading && !requestsLoading}
        message="Loading metrics"
      >
        <Body {...bodyProps} />
      </WithLoader>
    </>
  );
}

const Body = ({
  requestData,
  usageData,
  requestError,
  usageError,
  ...rest
}) => {
  if (requestError)
    return (
      <Notice className={styles.ErrorMessage}>
        An error occured while loading metrics: {requestError.message}
      </Notice>
    );
  else if (usageError)
    return (
      <Notice className={styles.ErrorMessage}>
        An error occured while loading metrics: {usageError.message}
      </Notice>
    );
  else
    return (
      <Content requestData={requestData} usageData={usageData} {...rest} />
    );
};

const Content = ({
  usageData,
  requestData,
  StartDisplay,
  EndDisplay,
  timePeriod,
}) => {
  const totalMediaThroughput = usageData.MediaConsumption.TotalGBs;
  const totalMediaRequests = usageData.MediaConsumption.TotalRequests;

  const totalRequestThroughput = requestData.TotalThroughputGB;
  const totalPageRequests = requestData.TotalRequests;

  const totalRequests = totalPageRequests + totalMediaRequests;
  const totalThroughput = totalMediaThroughput + totalRequestThroughput;

  const colors = [
    "#75bf25",
    "#497edf",
    "#ffdd57",
    "#e53c05",
    "#404759",
    "#f17829",
  ];

  const pieChartData = {
    labels: ["Media Requests", "Page Requests"],
    datasets: [
      {
        data: [totalMediaRequests, totalPageRequests],
        backgroundColor: colors,
      },
    ],
  };
  const barChartLabels = [];
  const barChartSeries = [];
  for (const req of requestData.ResponseCodes) {
    barChartLabels.push(req.Code);
    barChartSeries.push(req.RequestCount);
  }

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      { data: barChartSeries, label: "Requests", backgroundColor: colors },
    ],
  };

  const Media = ({ media }) => {
    const fullPath = media.FullPath;

    const path =
      media.FileName.length > 39
        ? media.FileName.substring(1, 42) + "..."
        : media.FileName.substring(1, 50);
    const requests = numberWithCommas(media.Requests);
    const throughput = floatWithCommas(media.ThroughtputGB) + "GB";

    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell)}>
          <Link
            underline="none"
            color="secondary"
            href={fullPath}
            target="_blank"
            title="Redirect URL"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;<code>{path}</code>
          </Link>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  const TopReqAllRow = ({ req }) => {
    const count = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell)}>{req.Code}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{count}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  // Calculate number of requests for each type
  // This is a map of req code -> number of reqs
  const reqs = {
    other: 0,
    200: 0,
    301: 0,
    404: 0,
    403: 0,
  };
  for (let i = 0; i < requestData.ResponseCodes.length; i++) {
    const code = requestData.ResponseCodes[i].Code;
    const count = requestData.ResponseCodes[i].RequestCount;
    switch (code) {
      case 200:
      case 301:
      case 404:
      case 403:
        reqs[code] = count;
        break;
      default:
        reqs.other += count;
        break;
    }
  }

  return (
    <>
      <header>
        <Card sx={{ m: 2 }}>
          <CardHeader title={usageData.Account.Name}></CardHeader>

          <CardContent
            className={styles.CardContentHeader}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <h1 className={styles.headline}>
              {`Usage Report for ${timePeriod} ${
                timePeriod > 1 ? "days" : "day"
              } : ${StartDisplay} - ${EndDisplay}`}
            </h1>
            <aside>
              <p>
                Instance ZUID:
                <CopyButton
                  size="small"
                  value={usageData.Account.Zuid}
                  sx={{ ml: 1 }}
                />
              </p>

              <p>
                CDN URL:&nbsp;
                <CopyButton
                  size="small"
                  value={usageData.Account.CdnURL}
                  sx={{ ml: 1 }}
                />
              </p>
            </aside>
          </CardContent>
        </Card>
      </header>
      {/* Total Usage Breakdown */}
      <figure>
        <Card sx={{ m: 2 }}>
          <CardHeader title="Total Usage Breakdown"></CardHeader>
          <CardContent className={styles.CardContentGraphs}>
            <div className={styles.GraphTitles}>
              <p>Total Bandwidth</p>
              <h1 className={styles.headline}>
                {floatWithCommas(totalThroughput)} GB
              </h1>
              <p>Total Requests</p>
              <h1 className={styles.headline}>
                {numberWithCommas(totalRequests)}
              </h1>
            </div>

            <div id="chart2">
              <Pie
                data={pieChartData}
                max-width="100%"
                options={{ maintainAspectRatio: false }}
              />
            </div>

            <div id="chart2">
              <Bar data={barChartData} max-width="100%" />
            </div>
          </CardContent>
        </Card>
      </figure>

      {/* Bandwidth Breakdown */}
      <section>
        <Card sx={{ m: 2 }}>
          <CardHeader title="Bandwidth Breakdown"></CardHeader>
          <CardContent className={styles.CardContentBandwidth}>
            <div>
              <p>Total Bandwidth</p>
              <p className={styles.headline}>
                {floatWithCommas(totalThroughput)} GB
              </p>
            </div>

            <div>
              <p>HTML/CSS/Javascript Bandwidth</p>
              <p
                className={cx(
                  styles.headline,
                  styles.IsSuccess,
                  styles.requestThroughput
                )}
              >
                {floatWithCommas(totalRequestThroughput)} GB
              </p>
            </div>

            <div>
              <p>Media Bandwidth</p>
              <p className={cx(styles.headline, styles.IsInfo)}>
                {floatWithCommas(totalMediaThroughput)} GB
              </p>
            </div>

            <div>
              <p>Successful Media Requests</p>
              <p className={cx(styles.IsInfo, styles.headline)}>
                {numberWithCommas(usageData.MediaConsumption.TotalRequests)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card sx={{ m: 2 }}>
          <CardHeader title="Platform Request Breakdown (Total)"></CardHeader>
          <CardContent className={styles.CardContentRequest}>
            <div>
              <p>Successful Page Loads (200)</p>
              <p className={cx(styles.IsSuccess, styles.headline)}>
                {numberWithCommas(reqs["200"])}
              </p>
            </div>

            <div>
              <p>Page Redirects (301)</p>
              <p className={cx(styles.IsWarning, styles.headline)}>
                {numberWithCommas(reqs["301"])}
              </p>
            </div>

            <div>
              <p>Failing Not Found (404)</p>
              <p className={cx(styles.IsOrange, styles.headline)}>
                {numberWithCommas(reqs["404"])}
              </p>
            </div>

            <div>
              <p>Malicious/Deflected (403)</p>
              <p className={cx(styles.IsDanger, styles.headline)}>
                {numberWithCommas(reqs["403"])}
              </p>
            </div>

            <div>
              <p>Other</p>
              <p className={styles.headline}>
                {numberWithCommas(reqs["other"])}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <main className={styles.TableContainer}>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title="Top Requested Pages"
              sx={{ color: "success.main" }}
            ></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                    <th className={cx(styles.MetricsTableRowCell)}>Requests</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top Request Pages 200 */}
                  {requestData.TopRequestByFilePathAndResponseCode[0].TopPaths?.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          req.Path.length > 39
                            ? req.Path.substring(0, 42) + "..."
                            : req.Path
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title="Top Requested Media"
              sx={{ color: "secondary.main" }}
            ></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      File Name
                    </th>
                    <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.TopMedia?.map((m, i) => (
                    <Media media={m} key={i} />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title="Top File Not Found (404)"
              sx={{ color: "warning.main" }}
            ></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                    <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top Request 404 */}
                  {requestData.TopRequestByFilePathAndResponseCode[2]?.TopPaths?.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          req.Path.length > 30
                            ? req.Path.substring(0, 30) + "..."
                            : req.Path
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title="Top 301 Redirects"
              sx={{ color: "warning.main" }}
            ></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                    <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top Requested 301 */}
                  {requestData.TopRequestByFilePathAndResponseCode[1]?.TopPaths?.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          req.Path.length > 30
                            ? req.Path.substring(0, 30) + "..."
                            : req.Path
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title="Top Malicous / Deflected Requests"
              sx={{ color: "error.main" }}
            ></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                    <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Top Request 403 */}
                  {requestData.TopRequestByFilePathAndResponseCode[3]?.TopPaths?.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          req.Path.length > 100
                            ? req.Path.substring(0, 97) + "..."
                            : req.Path
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader title="All Response Codes"></CardHeader>
            <CardContent>
              <table className={cx(styles.MetricsTable)}>
                <thead>
                  <tr className={cx(styles.MetricsTableRow)}>
                    <th className={cx(styles.MetricsTableRowCell)}>Code</th>
                    <th className={cx(styles.MetricsTableRowCell)}>Requests</th>
                    <th className={cx(styles.MetricsTableRowCell)}>
                      Bandwidth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {requestData.ResponseCodes?.map((req, i) => (
                    <TopReqAllRow req={req} key={i} />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};
