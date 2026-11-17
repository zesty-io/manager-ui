import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import TopReq from "./TopReq";
import { useTranslation } from "react-i18next";

import { WithLoader } from "shell/components/legacy/WithLoader";

import { CopyButton } from "@zesty-io/material";

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Link from "@mui/material/Link";
import { Box, Typography } from "@mui/material";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import { Pie, Bar } from "react-chartjs-2";
import { Notice } from "shell/components/legacy/Notice";

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

// Holds the legacy headline metrics on top of the h3 variant
const headlineSx = {
  fontWeight: 200,
  lineHeight: "42px",
  letterSpacing: "0.32px",
};

// Styles every row and cell of the request tables, including TopReq's rows
const metricsTableSx = (theme) => ({
  borderCollapse: "collapse",
  textAlign: "left",
  width: "100%",
  "& > thead": {
    fontSize: theme.typography.body2.fontSize,
  },
  "& tr": {
    bgcolor: "common.white",
    alignItems: "center",
    "&:nth-of-type(odd)": {
      bgcolor: "grey.50",
    },
    "&:hover, &:focus, &:active, &:nth-of-type(odd):hover, &:nth-of-type(odd):focus, &:nth-of-type(odd):active":
      {
        bgcolor: "grey.100",
      },
  },
  "& td, & th": {
    p: 2,
    "& a": {
      display: "inline-block",
      maxWidth: 500,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    "& svg": {
      mr: 1,
    },
  },
});

export default function Metrics() {
  const { t } = useTranslation();
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
      <Box
        component="section"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          mt: 2,
        }}
      >
        <ButtonGroup variant="contained">
          <Button
            data-cy="metrics-past-day"
            title={t("reports.pastDay")}
            onClick={() => setTimePeriod(1)}
            disabled={timePeriod === 1}
          >
            {t("reports.pastDay")}
          </Button>
          <Button
            data-cy="metrics-past-7-days"
            title={t("reports.pastDayWeek")}
            onClick={() => setTimePeriod(7)}
            disabled={timePeriod === 7}
          >
            {t("reports.past7Days")}
          </Button>
          <Button
            data-cy="metrics-past-30-days"
            title={t("reports.past30Days")}
            onClick={() => setTimePeriod(30)}
            disabled={timePeriod === 30}
          >
            {t("reports.past30Days")}
          </Button>
        </ButtonGroup>

        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 400, letterSpacing: "0.08px" }}
        >
          {/* eslint-disable-next-line i18next/no-literal-string -- brand name */}
          <>Zesty.io</> {t("reports.usageReport")}
        </Typography>
      </Box>

      <WithLoader
        width="100%"
        height="calc(100vh - 54px)"
        condition={!usageLoading && !requestsLoading}
        message={t("reports.loadingMetrics")}
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
  const { t } = useTranslation();
  if (requestError) {
    return (
      <Box sx={{ m: 2 }}>
        <Notice>
          {t("reports.metricsLoadError", { message: requestError.message })}
        </Notice>
      </Box>
    );
  } else if (usageError) {
    return (
      <Box sx={{ m: 2 }}>
        <Notice>
          {t("reports.metricsLoadError", { message: usageError.message })}
        </Notice>
      </Box>
    );
  } else {
    return (
      <Content requestData={requestData} usageData={usageData} {...rest} />
    );
  }
};

const Content = ({
  usageData,
  requestData,
  StartDisplay,
  EndDisplay,
  timePeriod,
}) => {
  const { t } = useTranslation();
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
    labels: [t("common.mediaRequests"), t("reports.pageRequests")],
    datasets: [
      {
        data: [totalMediaRequests, totalPageRequests],
        backgroundColor: colors,
      },
    ],
  };
  const barChartLabels = [];
  const barChartSeries = [];
  const responseCodes = requestData.ResponseCodes || [];
  for (const req of responseCodes) {
    barChartLabels.push(req.Code);
    barChartSeries.push(req.RequestCount);
  }

  const barChartData = {
    labels: barChartLabels,
    datasets: [
      {
        data: barChartSeries,
        label: t("reports.requests"),
        backgroundColor: colors,
      },
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
      <tr>
        <td>
          <Link
            data-cy="metrics-media-link"
            underline="none"
            color="secondary"
            href={fullPath}
            target="_blank"
            title={t("reports.redirectUrl")}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
            &nbsp;<code>{path}</code>
          </Link>
        </td>
        <td>{requests}</td>
        <td>{throughput}</td>
      </tr>
    );
  };

  const TopReqAllRow = ({ req }) => {
    const count = numberWithCommas(req.RequestCount);
    const throughput = floatWithCommas(req.DataThroughputInGB) + "GB";
    return (
      <tr>
        <td>{req.Code}</td>
        <td>{count}</td>
        <td>{throughput}</td>
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
  for (let i = 0; i < responseCodes.length; i++) {
    const code = responseCodes[i].Code;
    const count = responseCodes[i].RequestCount;
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
            sx={{
              display: "flex",
              justifyContent: "space-between",
              "& aside p:not(:last-child)": { pb: 1 },
            }}
          >
            <Typography variant="h3" component="h1" sx={headlineSx}>
              {t("reports.usageReportFor", {
                timePeriod,
                unit: timePeriod > 1 ? "days" : "day",
                startDisplay: StartDisplay,
                endDisplay: EndDisplay,
              })}
            </Typography>
            <aside>
              <p>
                {t("reports.instanceZuid")}
                {":"}
                <CopyButton
                  size="small"
                  value={usageData.Account.Zuid}
                  sx={{ ml: 1 }}
                />
              </p>

              <p>
                {t("reports.cdnUrl")}
                {":"}
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
          <CardHeader title={t("reports.totalUsageBreakdown")}></CardHeader>
          <CardContent
            sx={{
              display: "grid",
              gridTemplateColumns:
                "minmax(100px, 200px) repeat(auto-fit, minmax(320px, 1fr))",
              gap: 2,
              alignItems: "center",
              "@media only screen and (max-width: 1300px)": {
                gridTemplateColumns: "auto",
                gridTemplateRows: "1fr 1fr 1fr",
                justifyItems: "center",
              },
            }}
          >
            <Box sx={{ justifySelf: "center" }}>
              <p>{t("reports.totalBandwidth")}</p>
              <Typography variant="h3" component="h1" sx={headlineSx}>
                {floatWithCommas(totalThroughput)} GB
              </Typography>
              <p>{t("reports.totalRequests")}</p>
              <Typography variant="h3" component="h1" sx={headlineSx}>
                {numberWithCommas(totalRequests)}
              </Typography>
            </Box>

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
          <CardHeader title={t("reports.bandwidthBreakdown")}></CardHeader>
          <CardContent
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, auto)",
              gap: 2,
            }}
          >
            <div>
              <p>{t("reports.totalBandwidth")}</p>
              <Typography variant="h3" component="p" sx={headlineSx}>
                {floatWithCommas(totalThroughput)} GB
              </Typography>
            </div>

            <div>
              <p>{t("reports.htmlCssBandwidth")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "success.main" }}
              >
                {floatWithCommas(totalRequestThroughput)} GB
              </Typography>
            </div>

            <div>
              <p>{t("reports.mediaBandwidth")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "info.main" }}
              >
                {floatWithCommas(totalMediaThroughput)} GB
              </Typography>
            </div>

            <div>
              <p>{t("reports.successfulMediaRequests")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "info.main" }}
              >
                {numberWithCommas(usageData.MediaConsumption.TotalRequests)}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card sx={{ m: 2 }}>
          <CardHeader
            title={t("reports.platformRequestBreakdown")}
          ></CardHeader>
          <CardContent
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, auto)",
              gap: 2,
            }}
          >
            <div>
              <p>{t("reports.successfulPageLoads")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "success.main" }}
              >
                {numberWithCommas(reqs["200"])}
              </Typography>
            </div>

            <div>
              <p>{t("reports.pageRedirects")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "warning.main" }}
              >
                {numberWithCommas(reqs["301"])}
              </Typography>
            </div>

            <div>
              <p>{t("reports.failingNotFound")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "deepOrange.400" }}
              >
                {numberWithCommas(reqs["404"])}
              </Typography>
            </div>

            <div>
              <p>{t("reports.maliciousDeflected")}</p>
              <Typography
                variant="h3"
                component="p"
                sx={{ ...headlineSx, color: "error.main" }}
              >
                {numberWithCommas(reqs["403"])}
              </Typography>
            </div>

            <div>
              <p>{t("reports.other")}</p>
              <Typography variant="h3" component="p" sx={headlineSx}>
                {numberWithCommas(reqs["other"])}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </section>
      <Box
        sx={{
          "@media only screen and (min-width: 2000px)": {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
          },
        }}
      >
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title={t("reports.topRequestedPages")}
              sx={{ color: "success.main" }}
            ></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("reports.url")}</th>
                    <th>{t("reports.requests")}</th>
                    <th>{t("reports.bandwidth")}</th>
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
              </Box>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title={t("reports.topRequestedMedia")}
              sx={{ color: "secondary.main" }}
            ></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("reports.fileName")}</th>
                    <th>{t("reports.request")}</th>
                    <th>{t("reports.bandwidth")}</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.TopMedia?.map((m, i) => (
                    <Media media={m} key={i} />
                  ))}
                </tbody>
              </Box>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title={t("reports.topFileNotFound")}
              sx={{ color: "warning.main" }}
            ></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("reports.url")}</th>
                    <th>{t("reports.request")}</th>
                    <th>{t("reports.bandwidth")}</th>
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
              </Box>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title={t("reports.top301Redirects")}
              sx={{ color: "warning.main" }}
            ></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("reports.url")}</th>
                    <th>{t("reports.request")}</th>
                    <th>{t("reports.bandwidth")}</th>
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
              </Box>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader
              title={t("reports.topMaliciousDeflected")}
              sx={{ color: "error.main" }}
            ></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("reports.url")}</th>
                    <th>{t("reports.request")}</th>
                    <th>{t("reports.bandwidth")}</th>
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
              </Box>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card sx={{ m: 2 }}>
            <CardHeader title={t("reports.allResponseCodes")}></CardHeader>
            <CardContent>
              <Box component="table" sx={metricsTableSx}>
                <thead>
                  <tr>
                    <th>{t("common.code")}</th>
                    <th>{t("reports.requests")}</th>
                    <th>{t("reports.bandwidth")}</th>
                  </tr>
                </thead>
                <tbody>
                  {responseCodes.map((req, i) => (
                    <TopReqAllRow req={req} key={i} />
                  ))}
                </tbody>
              </Box>
            </CardContent>
          </Card>
        </section>
      </Box>
    </>
  );
};
