import { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { WithLoader } from "@zesty-io/core/WithLoader";

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

export default connect((state) => {
  return {
    zuid: state.instance.ZUID,
  };
})(function Metrics(props) {
  const [timePeriod, setTimePeriod] = useState(30);
  const { start, end } = getDates(timePeriod);
  const { zuid } = props;
  const { usageEndPoint, requestsEndPoint } = getEndpointUrls({
    zuid,
    start,
    end,
  });
  const [usageData, setUsageData] = useState();
  const [requestData, setRequestsData] = useState();

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

  const bodyProps = { usageData, requestData };
  return (
    <>
      <ButtonGroup>
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
      <WithLoader condition={usageData} message="Loading billing metrics...">
        <WithLoader
          condition={requestData}
          message="Loading billing metrics..."
        >
          <Body {...bodyProps} />
        </WithLoader>
      </WithLoader>
    </>
  );
});

const Body = ({ usageData, requestData }) => {
  let totalMediaThroughput = usageData.MediaConsumption.TotalGBs;
  let totalMediaRequests = usageData.MediaConsumption.TotalRequests;

  let totalRequestThroughput = requestData.TotalThroughputGB;
  let totalPageRequests = requestData.TotalRequests;

  let totalRequests = totalPageRequests + totalMediaRequests;
  let totalThroughput = totalMediaThroughput + totalRequestThroughput;

  const colors = [
    "#009e6c",
    "#00d1b2",
    "#ffdd57",
    "#ff3860",
    "#747474",
    "orange",
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
          <a href={fullPath} target="_blank">
            {path}
          </a>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  const TopReq200Row = ({ req }) => {
    if (req == undefined) return null;

    const fullPath = req.FullPath;
    let path = req.Path;
    path = path.length > 39 ? path.substring(0, 42) + "..." : path;

    const requests = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests200TableRows
    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell)}>
          <a href={fullPath} target="_blank">
            {path}
          </a>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  const TopReq404Row = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    const path =
      req.Path.length > 30 ? req.Path.substring(0, 30) + "..." : req.Path;

    const requests = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests404TableRows
    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell)}>
          <a href={fullPath} target="_blank">
            {path}
            <span>[{req.Host}]</span>'
          </a>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };
  const TopReq301Row = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    let path = req.Path;
    path = path.length > 30 ? path.substring(0, 30) + "..." : path;

    const requests = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests301TableRows
    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell, "fixedTD")}>
          <a href={fullPath} target="_blank">
            {path}
            <span>[{req.Host}]</span>
          </a>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  const TopReq403Row = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    let path = req.Path;
    path = path.length > 100 ? path.substring(0, 97) + "..." : path;

    const requests = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests403TableRows
    return (
      <tr className={cx(styles.MetricsTableRow)}>
        <td className={cx(styles.MetricsTableRowCell)}>
          <a href={fullPath} target="_blank">
            {path}
            <span>[{req.Host}]</span>
          </a>
        </td>
        <td className={cx(styles.MetricsTableRowCell)}>{requests}</td>
        <td className={cx(styles.MetricsTableRowCell)}>{throughput}</td>
      </tr>
    );
  };

  const TopReqAllRow = ({ req }) => {
    const count = req.RequestCount;
    const throughput = req.DataThroughputInGB;
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
      <section>
        <div className="hero-body zesty-header">
          <h1 className="subtitle">
            <strong>Zesty.io</strong> Usage Report{" "}
            <span className="monthNameYear">Month 20XX</span>
          </h1>
        </div>
      </section>
      <section>
        <div>
          <h1>
            <span id="siteName">{usageData.Account.Name}</span>
          </h1>
          <h2>
            <span className="monthNameYear">Month 20XX</span> Report for
            <strong id="siteURL">{usageData.Account.Domain}</strong>
          </h2>
        </div>
        <div>
          <p>
            <strong>Instance ZUID:</strong>{" "}
            <span id="instanceZUID">{usageData.Account.Zuid}</span>
            <br />
            <strong>Legacy ID:</strong>{" "}
            <span id="instanceID">{usageData.Account.ID}</span>
            <br />
            <strong>CDN URL:</strong>{" "}
            <span id="cdnURL">{usageData.Account.CdnURL}</span>
          </p>
        </div>
      </section>
      <Card>
        <CardHeader>
          <h2>
            <strong>Total Usage Breakdown</strong>
          </h2>
        </CardHeader>
        <CardContent>
          <nav>
            <div>
              <div>
                <p>Total Bandwidth</p>
                <h1>{floatWithCommas(totalThroughput)} GB</h1>
                <p>Total Requests</p>
                <h1 id="totalRequests">{numberWithCommas(totalRequests)}</h1>
              </div>
            </div>
            <div>
              <div id="chart2">
                <Pie data={pieChartData} />
              </div>
            </div>
            <div>
              <div id="chart2">
                <Bar data={barChartData} />
              </div>
            </div>
          </nav>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h2>
            <strong>Bandwidth Breakdown</strong>
          </h2>
        </CardHeader>
        <CardContent>
          <nav>
            <div>
              <div>
                <p>Total Bandwidth</p>
                <p>{floatWithCommas(totalThroughput)} GB</p>
              </div>
            </div>

            <div>
              <div>
                <p>HTML/CSS/Javascript Bandwidth</p>
                <p
                  className={cx(
                    styles.title,
                    styles.IsSuccess,
                    styles.requestThroughput
                  )}
                >
                  {floatWithCommas(totalRequestThroughput)} GB
                </p>
              </div>
            </div>
            <div>
              <div>
                <p>Media Bandwidth</p>
                <p className={cx(styles.IsInfo)} id="mediaThroughput">
                  {totalMediaThroughput} GB
                </p>
              </div>
            </div>
            <div>
              <div>
                <p>Successful Media Requests</p>
                <p className={cx(styles.IsInfo)} id="requestsMedia">
                  {numberWithCommas(usageData.MediaConsumption.TotalRequests)}
                </p>
              </div>
            </div>
          </nav>
        </CardContent>
      </Card>
      <br />

      <Card>
        <CardHeader>
          <h2>
            <strong>
              Platform Request Breakdown (<span id="totalAllRequests"></span>{" "}
              Total)
            </strong>
          </h2>
        </CardHeader>
        <CardContent>
          <nav>
            <div>
              <div>
                <p>Successful Page Loads (200)</p>
                <p className={cx(styles.IsSuccess)} id="requests200">
                  {reqs["200"]}
                </p>
              </div>
            </div>

            <div>
              <div>
                <p>Page Redirects (301)</p>
                <p className={cx(styles.IsWarning)} id="requests301">
                  {reqs["301"]}
                </p>
              </div>
            </div>
            <div>
              <div>
                <p>Failing Not Found (404)</p>
                <p className={cx(styles.IsOrange)} id="requests404">
                  {reqs["404"]}
                </p>
              </div>
            </div>

            <div>
              <div>
                <p>Malicious/Deflected (403)</p>
                <p className={cx(styles.IsDanger)} id="requests403">
                  {reqs["403"]}
                </p>
              </div>
            </div>

            <div>
              <div>
                <p>Other</p>
                <p id="otherRequests">{reqs["other"]}</p>
              </div>
            </div>
          </nav>
        </CardContent>
      </Card>
      <div>
        <div>
          <div>
            <div>
              <h2 className={cx(styles.IsSuccess)}>
                <strong>Top Requested Pages</strong>
              </h2>
            </div>
            <table className={cx(styles.MetricsTable)}>
              <thead>
                <tr className={cx(styles.MetricsTableRow)}>
                  <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Requests</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests200TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[0].TopPaths.map(
                  (req) => (
                    <TopReq200Row req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
          <div>
            <div>
              <h2 className={cx(styles.IsInfo)}>
                <strong>Top Requested Media</strong>
              </h2>
            </div>
            <table className={cx(styles.MetricsTable)}>
              <thead>
                <tr className={cx(styles.MetricsTableRow)}>
                  <th className={cx(styles.MetricsTableRowCell)}>File Name</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="mediaTableRows">
                {usageData.TopMedia.map((m) => (
                  <Media media={m} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div>
          <div>
            <div>
              <h2 className={cx(styles.IsOrange)}>
                <strong>Top File Not Found (404)</strong>
              </h2>
            </div>
            <table className={cx(styles.MetricsTable)}>
              <thead>
                <tr className={cx(styles.MetricsTableRow)}>
                  <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests404TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[2].TopPaths.map(
                  (req) => (
                    <TopReq404Row req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
          <div>
            <div>
              <h2 className={cx(styles.IsWarning)}>
                <strong>Top 301 Redirects</strong>
              </h2>
            </div>
            <table className={cx(styles.MetricsTable)}>
              <thead>
                <tr className={cx(styles.MetricsTableRow)}>
                  <th className={cx(styles.MetricsTableRowCell)}>URL</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Request</th>
                  <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests301TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[1].TopPaths.map(
                  (req) => (
                    <TopReq301Row req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        <div>
          <h2 className={cx(styles.IsDanger)}>
            <strong>Top Malicous / Deflected Requests</strong>
          </h2>
        </div>
        <table className={cx(styles.MetricsTable)}>
          <thead>
            <tr className={cx(styles.MetricsTableRow)}>
              <th className={cx(styles.MetricsTableRowCell)}>URL</th>
              <th className={cx(styles.MetricsTableRowCell)}>Request</th>
              <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
            </tr>
          </thead>
          <tbody id="requests403TableRows">
            {requestData.TopRequestByFilePathAndResponseCode[3].TopPaths.map(
              (req) => (
                <TopReq403Row req={req} />
              )
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div>
          <h2>
            <strong>All Response Codes</strong>
          </h2>
        </div>
        <table className={cx(styles.MetricsTable)}>
          <thead>
            <tr className={cx(styles.MetricsTableRow)}>
              <th className={cx(styles.MetricsTableRowCell)}>Code</th>
              <th className={cx(styles.MetricsTableRowCell)}>Requests</th>
              <th className={cx(styles.MetricsTableRowCell)}>Bandwidth</th>
            </tr>
          </thead>
          <tbody id="requestsAll">
            {requestData.ResponseCodes.map((req) => (
              <TopReqAllRow req={req} />
            ))}
          </tbody>
        </table>
      </div>
      <section>
        <div>
          <div>
            <div>
              <div>
                <h1>
                  <strong>Zesty.io</strong> Usage Report
                </h1>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
