import { useEffect, useState } from "react";
import cx from "classnames";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import TopReq from "./TopReq";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { CopyButton } from "@zesty-io/core/CopyButton";

import { request } from "utility/request";

import styles from "./Metrics.less";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Pie, Bar } from "react-chartjs-2";

// Returns a date range representing the last N days
// TODO double & triple check this
const getDates = (numDays) => {
  const end = new Date();
  const start = new Date(end);

  start.setDate(start.getDate() - numDays);

  return { start, end };
};

const getEndpointUrls = ({ zuid, start, end }) => {
  // TODO see if this url can be converted to a prettier one
  const base = "https://metrics-api-m3rbwjxm5q-uc.a.run.app/accounts";
  const dateStart = start.toISOString().split("T")[0];
  const dateEnd = end.toISOString().split("T")[0];

  const params = `dateStart=${dateStart}&dateEnd=${dateEnd}`;
  const usageEndPoint = `${base}/${zuid}/usage?${params}`;
  const requestsEndPoint = `${base}/${zuid}/requests?${params}`;
  return {
    usageEndPoint,
    requestsEndPoint,
  };
};

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const floatWithCommas = (x) => {
  x = x.toFixed(2);
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export default function Metrics(props) {
  const zuid = useSelector((state) => state.instance.ZUID);
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const { usageEndPoint, requestsEndPoint } = getEndpointUrls({
    zuid,
    start,
    end,
  });
  const [usageData, setUsageData] = useState();
  const [requestData, setRequestsData] = useState();

  let StartDisplay = start.toString().split(" ").slice(0, 3).join(" ");
  let EndDisplay = end.toString().split(" ").slice(0, 3).join(" ");

  useEffect(async () => {
    setUsageData();
    setRequestsData();
    const usageReq = request(usageEndPoint);
    const requestsReq = request(requestsEndPoint);
    const usageData = await usageReq;
    const requestData = await requestsReq;
    setUsageData(usageData);
    setRequestsData(requestData);
  }, [timePeriod]);

  const bodyProps = {
    usageData,
    requestData,
    StartDisplay,
    EndDisplay,
    timePeriod,
  };
  return (
    <>
      <section className={styles.MetricsHeader}>
        <ButtonGroup className={styles.BtnGroup}>
          <Button
            onClick={() => setTimePeriod(1)}
            text="Past day"
            disabled={timePeriod === 1}
          />
          <Button
            onClick={() => setTimePeriod(7)}
            text="Past 7 days"
            disabled={timePeriod === 7}
          />
          <Button
            onClick={() => setTimePeriod(30)}
            text="Past 30 days"
            disabled={timePeriod === 30}
          />
        </ButtonGroup>

        <h1 className={styles.subheadline}>Zesty.io Usage Report </h1>
      </section>

      <WithLoader
        width="100%"
        height="calc(100vh - 54px)"
        condition={usageData}
        message="Loading billing metrics..."
      >
        <WithLoader
          condition={requestData}
          message="Loading billing metrics..."
        >
          <Body {...bodyProps} />
        </WithLoader>
      </WithLoader>
    </>
  );
}

const Body = ({
  usageData,
  requestData,
  StartDisplay,
  EndDisplay,
  timePeriod,
}) => {
  let totalMediaThroughput = usageData.MediaConsumption.TotalGBs;
  let totalMediaRequests = usageData.MediaConsumption.TotalRequests;

  let totalRequestThroughput = requestData.TotalThroughputGB;
  let totalPageRequests = requestData.TotalRequests;

  let totalRequests = totalPageRequests + totalMediaRequests;
  let totalThroughput = totalMediaThroughput + totalRequestThroughput;

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
  for (let req of requestData.ResponseCodes) {
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
          <Url href={fullPath} target="_blank" title="Redirect URL">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;<code>{path}</code>
          </Url>
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

  const reqs = { other: 0 };
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
        <Card>
          <CardHeader>
            <h1 className={styles.title}>{usageData.Account.Name}</h1>
          </CardHeader>

          <CardContent className={styles.CardContentHeader}>
            <h1 className={styles.headline}>
              {`Usage Report for ${timePeriod} ${
                timePeriod > 1 ? "days" : "day"
              } : ${StartDisplay} - ${EndDisplay}`}
            </h1>
            <aside>
              <p>
                Instance ZUID:&nbsp;
                <CopyButton
                  kind="outlined"
                  size="compact"
                  value={usageData.Account.Zuid}
                />
              </p>

              <p>
                CDN URL:&nbsp;
                <CopyButton
                  kind="outlined"
                  size="compact"
                  value={usageData.Account.CdnURL}
                />
              </p>
            </aside>
          </CardContent>
        </Card>
      </header>
      {/* Total Usage Breakdown */}
      <figure>
        <Card>
          <CardHeader>
            <h2>
              <strong>Total Usage Breakdown</strong>
            </h2>
          </CardHeader>
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
              <Pie data={pieChartData} max-width="100%" height="auto" />
            </div>

            <div id="chart2">
              <Bar data={barChartData} max-width="100%" height="auto" />
            </div>
          </CardContent>
        </Card>
      </figure>

      {/* Bandwidth Breakdown */}
      <section>
        <Card>
          <CardHeader>
            <h2>
              <strong>Bandwidth Breakdown</strong>
            </h2>
          </CardHeader>
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
        <Card>
          <CardHeader>
            <h2>Platform Request Breakdown ( Total)</h2>
          </CardHeader>
          <CardContent className={styles.CardContentRequest}>
            <div>
              <p>Successful Page Loads (200)</p>
              <p className={cx(styles.IsSuccess, styles.headline)}>
                {reqs["200"]}
              </p>
            </div>

            <div>
              <p>Page Redirects (301)</p>
              <p className={cx(styles.IsWarning, styles.headline)}>
                {reqs["301"]}
              </p>
            </div>

            <div>
              <p>Failing Not Found (404)</p>
              <p className={cx(styles.IsOrange, styles.headline)}>
                {reqs["404"]}
              </p>
            </div>

            <div>
              <p>Malicious/Deflected (403)</p>
              <p className={cx(styles.IsDanger, styles.headline)}>
                {reqs["403"]}
              </p>
            </div>

            <div>
              <p>Other</p>
              <p className={styles.headline}>{reqs["other"]}</p>
            </div>
          </CardContent>
        </Card>
      </section>
      <main className={styles.TableContainer}>
        <section>
          <Card>
            <CardHeader>
              <h2 className={cx(styles.IsSuccess)}>Top Requested Pages</h2>
            </CardHeader>
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
                  {requestData.TopRequestByFilePathAndResponseCode[0].TopPaths.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          (req.Path =
                            req.Path.length > 39
                              ? req.Path.substring(0, 42) + "..."
                              : req.Path)
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
          <Card>
            <CardHeader>
              <h2 className={cx(styles.IsInfo)}>Top Requested Media</h2>
            </CardHeader>
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
                  {usageData.TopMedia.map((m, i) => (
                    <Media media={m} key={i} />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <h2 className={cx(styles.IsOrange)}>Top File Not Found (404)</h2>
            </CardHeader>
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
                  {requestData.TopRequestByFilePathAndResponseCode[2].TopPaths.map(
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
          <Card>
            <CardHeader>
              <h2 className={cx(styles.IsWarning)}>
                <strong>Top 301 Redirects</strong>
              </h2>
            </CardHeader>
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
                  {requestData.TopRequestByFilePathAndResponseCode[1].TopPaths.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          (req.Path =
                            req.Path.length > 30
                              ? req.Path.substring(0, 30) + "..."
                              : req.Path)
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
          <Card>
            <CardHeader>
              <h2 className={cx(styles.IsDanger)}>
                Top Malicous / Deflected Requests
              </h2>
            </CardHeader>
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
                  {requestData.TopRequestByFilePathAndResponseCode[3].TopPaths.map(
                    (req, i) => (
                      <TopReq
                        req={req}
                        key={i}
                        path={
                          (req.Path =
                            req.Path.length > 100
                              ? req.Path.substring(0, 97) + "..."
                              : req.Path)
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
          <Card>
            <CardHeader>
              <h2>All Response Codes</h2>
            </CardHeader>
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
                  {requestData.ResponseCodes.map((req, i) => (
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
