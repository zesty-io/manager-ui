import { useEffect, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";
import { useDomain } from "shell/hooks/use-domain";
import { useMetaKey } from "shell/hooks/useMetaKey";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faSave, faSpinner } from "@fortawesome/free-solid-svg-icons";

import { Url } from "@zesty-io/core/Url";
import { Button } from "@zesty-io/core/Button";
import { Notice } from "@zesty-io/core/Notice";
import { FieldTypeTextarea } from "@zesty-io/core/FieldTypeTextarea";
import { FieldTypeBinary } from "@zesty-io/core/FieldTypeBinary";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";

import styles from "./Metrics.less";
import { Divider } from "@zesty-io/core/Divider";

const getEndpointUrls = (zuid) => {
  // TODO see if this url can be converted to a prettier one
  const base = "https://metrics-api-m3rbwjxm5q-uc.a.run.app/accounts";
  // TODO add date ranges
  const dateStart = "2021-09-01";
  const dateEnd = "2021-09-30";

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
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

export default connect((state) => {
  return {
    zuid: state.instance.ZUID,
  };
})(function Metrics(props) {
  console.log(props);
  const { usageEndPoint, requestsEndPoint } = getEndpointUrls(props.zuid);
  const [loading, setLoading] = useState();
  const [usageData, setUsageData] = useState();
  const [requestData, setRequestsData] = useState();

  useEffect(async () => {
    console.log("start effect");
    const usageReq = request(usageEndPoint);
    const requestsReq = request(requestsEndPoint);
    const usageData = await usageReq;
    const requestData = await requestsReq;
    console.log({ usageData, requestData });
    setUsageData(usageData);
    setRequestsData(requestData);
    setLoading(true);
    console.log("end effect");
  }, []);

  const bodyProps = { usageData, requestData };
  return (
    <WithLoader condition={loading} message="Loading billing metrics...">
      <Body {...bodyProps} />
    </WithLoader>
  );
});

const Body = ({ usageData, requestData }) => {
  let totalMediaThroughput = usageData.MediaConsumption.TotalGBs;
  let totalMediaRequests = usageData.MediaConsumption.TotalRequests;

  let totalRequestThroughput = requestData.TotalThroughputGB;
  let totalPageRequests = requestData.TotalRequests;

  let totalRequests = totalPageRequests + totalMediaRequests;
  let totalThroughput = totalMediaThroughput + totalRequestThroughput;

  const Media = ({ media }) => {
    console.log(media);
    const fullPath = media.FullPath;

    const path =
      media.FileName.length > 39
        ? media.FileName.substring(1, 42) + "..."
        : media.FileName.substring(1, 50);
    const requests = numberWithCommas(media.Requests);
    const throughput = floatWithCommas(media.ThroughtputGB) + "GB";

    return (
      <tr>
        <td class="fixedTD">
          <a class="fixedTD" href={fullPath} target="_blank">
            {path}
          </a>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };

  const TopReq200 = ({ req }) => {
    if (req == undefined) return null;

    var fullPath = req.FullPath;
    var path = req.Path;
    path = path.length > 39 ? path.substring(0, 42) + "..." : path;

    var requests = numberWithCommas(req.RequestCount);
    var throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests200TableRows
    return (
      <tr>
        <td class="fixedTD">
          <a href={fullPath} target="_blank">
            {path}
          </a>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };

  const TopReq404 = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    const path =
      req.Path.length > 30 ? req.Path.substring(0, 30) + "..." : req.Path;

    const requests = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests404TableRows
    return (
      <tr>
        <td class="fixedTD">
          <a href={fullPath} target="_blank">
            {path}
            <span class="has-text-grey-light">[{req.Host}]</span>'
          </a>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };
  const TopReq301 = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    let path = req.Path;
    path = path.length > 30 ? path.substring(0, 30) + "..." : path;

    var requests = numberWithCommas(req.RequestCount);
    var throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests301TableRows
    return (
      <tr>
        <td class="fixedTD">
          <a href={fullPath} target="_blank">
            {path}
            <span class="has-text-grey-light">[{req.Host}]</span>
          </a>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };

  const TopReq403 = ({ req }) => {
    if (req == undefined) return null;
    const fullPath = req.FullPath;
    let path = req.Path;
    path = path.length > 100 ? path.substring(0, 97) + "..." : path;

    var requests = numberWithCommas(req.RequestCount);
    var throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    //#requests403TableRows
    return (
      <tr>
        <td class="fixedTD">
          <a href={fullPath} target="_blank">
            {path}
            <span class="has-text-grey-light">[{req.Host}]</span>
          </a>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };

  const reqs = {};
  for (let i = 0; i < requestData.ResponseCodes.length; i++) {
    const code = requestData.ResponseCodes[i].Code;
    const count = requestData.ResponseCodes[i].RequestCount;
    reqs[code] = count;
  }

  return (
    <>
      <section class="hero is-dark">
        <div class="hero-body zesty-header">
          <div class="container">
            <div class="columns">
              <div class="column">
                <h1 class="subtitle">
                  <strong>Zesty.io</strong> Usage Report{" "}
                  <span class="monthNameYear">Month 20XX</span>
                </h1>
              </div>
              <div class="column has-text-right"></div>
            </div>
          </div>
        </div>
      </section>
      <section class="hero is-medium is-primary is-bold">
        <div class="hero-body custom-hero">
          <div class="container">
            <div class="columns is-mobile">
              <div class="column">
                <h1 class="title">
                  <span id="siteName">{usageData.Account.Name}</span>
                </h1>
                <h2 class="subtitle">
                  <span class="monthNameYear">Month 20XX</span> Report for
                  <strong id="siteURL">{usageData.Account.Domain}</strong>
                </h2>
              </div>
              <div class="column has-text-right">
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
            </div>
          </div>
        </div>
      </section>
      <div class="container">
        <div class="notification">
          <h2 class="has-text-centered">
            <strong>Total Usage Breakdown</strong>
          </h2>
        </div>
        <nav class="level">
          <div class="level-item has-text-centered">
            <div>
              <p class="heading">Total Bandwidth</p>
              <h1 class="title totalThroughput">
                {floatWithCommas(totalThroughput)} GB
              </h1>
              <br />
              <br />
              <br />
              <p class="heading">Total Requests</p>
              <h1 class="title totalRequests" id="totalRequests">
                {numberWithCommas(totalRequests)}
              </h1>
            </div>
          </div>
          <div class="level-item has-text-centered">
            <div
              id="chart1"
              class="level-item ct-chart ct-perfect-fourth"
            ></div>
          </div>
          <div class="level-item has-text-centered">
            <div
              id="chart2"
              class="level-item ct-chart ct-perfect-fourth"
            ></div>
          </div>
        </nav>
      </div>
      <div class="notification">
        <h2 class="has-text-centered">
          <strong>Bandwidth Breakdown</strong>
        </h2>
      </div>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Total Bandwidth</p>
            <p class="title totalThroughput">
              {floatWithCommas(totalThroughput)} GB
            </p>
          </div>
        </div>

        <div class="level-item has-text-centered">
          <div>
            <p class="heading">HTML/CSS/Javascript Bandwidth</p>
            <p class="title is-success requestThroughput">
              {floatWithCommas(totalRequestThroughput)} GB
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Media Bandwidth</p>
            <p class="title is-info" id="mediaThroughput">
              0
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Successful Media Requests</p>
            <p class="title is-info" id="requestsMedia">
              {numberWithCommas(usageData.MediaConsumption.TotalRequests)}
            </p>
          </div>
        </div>
      </nav>
      <br />

      <div class="notification">
        <h2 class="has-text-centered">
          <strong>
            Platform Request Breakdown (<span id="totalAllRequests"></span>{" "}
            Total)
          </strong>
        </h2>
      </div>
      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Successful Page Loads (200)</p>
            <p class="title is-success" id="requests200">
              {reqs["200"]}
            </p>
          </div>
        </div>

        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Page Redirects (301)</p>
            <p class="title is-warning" id="requests301">
              {reqs["301"]}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Failing Not Found (404)</p>
            <p class="title is-orange" id="requests404">
              {reqs["404"]}
            </p>
          </div>
        </div>

        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Malicious/Deflected (403)</p>
            <p class="title is-danger" id="requests403">
              {reqs["403"]}
            </p>
          </div>
        </div>

        <div class="level-item has-text-centered">
          <div>
            <p class="heading">Other</p>
            <p class="title" id="otherRequests">
              0
            </p>
          </div>
        </div>
      </nav>

      <br />
      <div class="container">
        <div class="columns is-mobile">
          <div class="column is-half">
            <div class="notification has-text-centered">
              <h2 class="is-success">
                <strong>Top Requested Pages</strong>
              </h2>
            </div>
            <table class="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Requests</th>
                  <th>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests200TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[0].TopPaths.map(
                  (req) => (
                    <TopReq200 req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
          <div class="column is-half">
            <div class="notification has-text-centered">
              <h2 class="is-info">
                <strong>Top Requested Media</strong>
              </h2>
            </div>
            <table class="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Request</th>
                  <th>Bandwidth</th>
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
      <div class="container">
        <div class="columns is-mobile">
          <div class="column is-half">
            <div class="notification has-text-centered">
              <h2 class="is-orange">
                <strong>Top File Not Found (404)</strong>
              </h2>
            </div>
            <table class="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Requests</th>
                  <th>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests404TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[2].TopPaths.map(
                  (req) => (
                    <TopReq404 req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
          <div class="column is-half">
            <div class="notification has-text-centered">
              <h2 class="is-warning">
                <strong>Top 301 Redirects</strong>
              </h2>
            </div>
            <table class="table is-striped is-fullwidth">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Requests</th>
                  <th>Bandwidth</th>
                </tr>
              </thead>
              <tbody id="requests301TableRows">
                {requestData.TopRequestByFilePathAndResponseCode[1].TopPaths.map(
                  (req) => (
                    <TopReq301 req={req} />
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="notification has-text-centered">
          <h2 class="is-danger">
            <strong>Top Malicous / Deflected Requests</strong>
          </h2>
        </div>
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>URL</th>
              <th>Requests</th>
              <th>Bandwidth</th>
            </tr>
          </thead>
          <tbody id="requests403TableRows">
            {requestData.TopRequestByFilePathAndResponseCode[3].TopPaths.map(
              (req) => (
                <TopReq403 req={req} />
              )
            )}
          </tbody>
        </table>
      </div>

      <div class="container">
        <div class="notification has-text-centered">
          <h2>
            <strong>All Response Codes</strong>
          </h2>
        </div>
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Code</th>
              <th>Requests</th>
              <th>Bandwidth</th>
            </tr>
          </thead>
          <tbody id="requestsAll"></tbody>
        </table>
      </div>
      <section class="hero is-dark">
        <div class="hero-body zesty-header">
          <div class="container">
            <div class="columns">
              <div class="column">
                <h1 class="subtitle">
                  <strong>Zesty.io</strong> Usage Report
                </h1>
              </div>
              <div class="column has-text-right"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
