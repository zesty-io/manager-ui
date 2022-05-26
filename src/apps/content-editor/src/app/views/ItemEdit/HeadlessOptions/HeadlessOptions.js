import { Header } from "../components/Header";
import React, { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import CodeIcon from "@mui/icons-material/Code";
import SettingsIcon from "@mui/icons-material/Settings";

import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faFileCode,
  faBolt,
  faProjectDiagram,
  faNewspaper,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
import { faNpm } from "@fortawesome/free-brands-svg-icons";
import { Docs } from "@zesty-io/core/Docs";
import Divider from "@mui/material/Divider";
import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./HeadlessOptions.less";
export function HeadlessOptions(props) {
  const [headlessResponse, setHeadlessResponse] = useState(false);

  useEffect(() => {
    // You need to restrict it at some point
    // This is just dummy code and should be replaced by actual
    if (!headlessResponse) {
      getHeadlessResponse();
    }
  }, []);

  const getHeadlessResponse = async () => {
    try {
      let headlessRes = await fetch(headlessURL);
      let headlessData = await headlessRes.json();
      if (
        headlessData.headless.hasOwnProperty("mode") &&
        headlessData.headless.mode != "traditional"
      ) {
        setHeadlessResponse(headlessData.headless);
      } else {
        setHeadlessResponse(false);
      }
    } catch (err) {
      setHeadlessResponse(false);
    }
  };

  let previewURL = `${CONFIG.URL_PREVIEW_PROTOCOL}${props.instance.randomHashID}${CONFIG.URL_PREVIEW}`;
  let itemURL = `${props.item.web.path}`;
  let toJSONPath = `${itemURL}?toJSON`;
  let instantItemPath = `/-/instant/${props.itemZUID}.json`;
  let headlessURL = `${previewURL}/-/headless/`;
  let gqlPath = `/-/gql/${props.model.name.toLowerCase()}.json`;
  let restEndpoint = `https://${props.instance.ZUID}.api.zesty.io/v1/content/models/${props.modelZUID}/items/${props.itemZUID}`;

  const outputLinks = (endPath) => {
    return (
      <div>
        <h5>Dev (latest version)</h5>
        <Divider />
        <Link
          underline="none"
          color="secondary"
          href={`${previewURL}${endPath}`}
          target="_blank"
        >
          {`${props.instance.randomHashID}${CONFIG.URL_PREVIEW}`}
          {endPath}
        </Link>

        <h5>Stage</h5>
        {props.instance.domains
          .filter((domain) => domain.branch == "dev")
          .map((domain) => (
            <div key={`${domain.ZUID}${endPath}`}>
              <Divider />
              <Link
                underline="none"
                color="secondary"
                href={`https://${domain.domain}${endPath}`}
                target="_blank"
              >
                {domain.domain}
                {endPath}
              </Link>
            </div>
          ))}

        <h5>Production</h5>
        {props.instance.domains
          .filter((domain) => domain.branch == "live")
          .map((domain) => (
            <div key={`${domain.ZUID}${endPath}`}>
              <Divider />
              <Link
                underline="none"
                color="secondary"
                href={`https://${domain.domain}${endPath}`}
                target="_blank"
              >
                {domain.domain}
                {endPath}
              </Link>
            </div>
          ))}
      </div>
    );
  };

  return (
    <section className={styles.WebEngineWrap}>
      <Header
        instance={props.instance}
        modelZUID={props.modelZUID}
        model={props.model}
        itemZUID={props.itemZUID}
        item={props.item}
      ></Header>

      <div className={styles.HeadlessOptionsWrapper}>
        {!headlessResponse && (
          <Card className={styles.customCard}>
            <CardHeader className={styles.cardHeader}>
              <h2>
                <FontAwesomeIcon icon={faFileCode} />
                Change your WebEngine Mode to Access Headless Features
              </h2>
              <Docs
                subject="Zesty.io Modes"
                url="https://zesty.org/services/web-engine/modes"
              />
            </CardHeader>
            <div className={styles.useTags}>
              <span className={styles.smallTags}>Build Headlessly</span>{" "}
              <span className={styles.smallTags}>
                Power Remote Applications
              </span>{" "}
              <span className={styles.smallTags}>Access Content as JSON</span>
            </div>
            <CardContent>
              <p>
                Headless features allow you to integrate your content into
                Headless Websites, Mobile Applications, or Customer
                Applications. Learn more about{" "}
                <Link
                  underline="none"
                  color="secondary"
                  href="https://zesty.org/services/web-engine/modes"
                  subject="WebEngine modes"
                >
                  WebEngine Modes
                </Link>
              </p>
              <br />
              <br />
              <p>
                To access headless features, click the "Edit General Settings"
                button below, change your WebEngine Mode to Hybrid, and hit
                save.
              </p>
              <Divider />
              <AppLink to={`/settings/instance/general`} title="Edit Settings">
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<SettingsIcon />}
                >
                  Edit General Settings
                </Button>
              </AppLink>
            </CardContent>
          </Card>
        )}
        {headlessResponse && (
          <div>
            <div className={styles.HeadlessOptions}>
              {props.item.web.path && (
                <Card className={styles.customCard}>
                  <CardHeader className={styles.cardHeader}>
                    <h2>
                      <FontAwesomeIcon icon={faFileCode} />
                      URL to JSON
                    </h2>
                    <Docs
                      subject="Routing toJSON"
                      url={headlessResponse.routing.documentation}
                    />
                  </CardHeader>
                  <div className={styles.useTags}>
                    <span className={styles.smallTags}>Headless SSR</span>{" "}
                    <span className={styles.smallTags}>Headless Websites</span>
                  </div>
                  <CardContent>
                    <p>
                      {headlessResponse.routing.about} Access all routes from
                      the{" "}
                      <Link
                        underline="none"
                        color="secondary"
                        href={headlessResponse.routing.map}
                        target="_blank"
                      >
                        toJSON Routing Map
                      </Link>
                      .
                    </p>
                    {outputLinks(toJSONPath)}
                  </CardContent>
                </Card>
              )}
              <Card className={styles.customCard}>
                <CardHeader className={styles.cardHeader}>
                  <h2>
                    <FontAwesomeIcon icon={faBolt} />
                    Instant JSON API
                  </h2>
                  <Docs
                    subject="Instant API"
                    url={headlessResponse.instant.documentation}
                  />
                </CardHeader>
                <div className={styles.useTags}>
                  <span className={styles.smallTags}>Mobile Applications</span>{" "}
                  <span className={styles.smallTags}>Headless Applets</span>
                </div>
                <CardContent>
                  <p>
                    {headlessResponse.instant.about} View the{" "}
                    <Link
                      underline="none"
                      color="secondary"
                      href={headlessResponse.instant.map}
                      target="_blank"
                    >
                      Instant JSON Map
                    </Link>
                  </p>
                  {outputLinks(instantItemPath)}
                </CardContent>
              </Card>
              <Card className={styles.customCard}>
                <CardHeader className={styles.cardHeader}>
                  <h2>
                    <FontAwesomeIcon icon={faProjectDiagram} />
                    GraphQL API
                  </h2>
                  <Docs
                    subject="GraphQL API"
                    url={headlessResponse.gql.documentation}
                  />
                </CardHeader>
                <div className={styles.useTags}>
                  <span className={styles.smallTags}>
                    GraphQL Implementations
                  </span>{" "}
                  <span className={styles.smallTags}>Middleware</span>
                </div>
                <CardContent>
                  <p>
                    {headlessResponse.gql.about} View the{" "}
                    <Link
                      underline="none"
                      color="secondary"
                      href={headlessResponse.gql.map}
                      target="_blank"
                    >
                      GQL Map endpoint
                    </Link>
                    . Note this item is only accessible by traversing through
                    the data array on the model's GQL endpoint.{" "}
                    <Link
                      underline="none"
                      color="secondary"
                      href="https://github.com/zesty-io/graphql-zesty"
                      target="_blank"
                    >
                      GraphQL Apollo Github Link
                    </Link>
                    .
                  </p>
                  {outputLinks(gqlPath)}
                </CardContent>
              </Card>
            </div>
            <div className={styles.HeadlessOptions}>
              <Card className={styles.customCard}>
                <CardHeader className={styles.cardHeader}>
                  <h2>
                    <FontAwesomeIcon icon={faUnlockAlt} />
                    Instances Rest API
                  </h2>
                  <Docs
                    subject="Instances Rest API"
                    url="https://instances-api.zesty.org/"
                  />
                </CardHeader>
                <div className={styles.useTags}>
                  <span className={styles.smallTags}>Automation</span>
                  <span className={styles.smallTags}>
                    User Generated Content
                  </span>
                  <span className={styles.smallTags}>Custom Apps</span>
                </div>
                <CardContent>
                  <p>
                    Authenticated READ/WRITE REST API that grants full access to
                    Create, Read, Update, Delete, and Publish Commands. This API
                    can be accessed through direct Rest API call or from our
                    Node SDK. Requireds a developer token or user authentication
                    token to access.
                  </p>

                  <h5>Rest Endpoint (needs authentication bearer)</h5>
                  <Divider />
                  <Link
                    href={restEndpoint}
                    target="_blank"
                    underline="none"
                    color="secondary"
                  >
                    {restEndpoint}
                  </Link>
                  <h5>Full REST Documentation</h5>
                  <Divider />
                  <Link
                    underline="none"
                    color="secondary"
                    href="https://instances-api.zesty.org/"
                    target="_blank"
                  >
                    instances-api.zesty.org
                  </Link>
                  <h5 className={styles.cardHeader}>
                    <FontAwesomeIcon icon={faNpm} /> <span> Node SDK</span>{" "}
                    <Docs
                      subject="Node SDK"
                      url="https://zesty.org/tools/node-sdk"
                    />
                  </h5>
                  <Divider />
                  <Link
                    underline="none"
                    color="secondary"
                    href="https://www.npmjs.com/package/@zesty-io/sdk"
                    target="_blank"
                  >
                    www.npmjs.com/package/@zesty-io/sdk
                  </Link>
                </CardContent>
              </Card>
              <Card className={styles.customCard}>
                <CardHeader className={styles.cardHeader}>
                  <h2>
                    <FontAwesomeIcon icon={faCode} />
                    Custom Endpoints
                  </h2>
                  <Docs
                    subject="Custom Parsley Endpoints"
                    url={headlessResponse.custom.documentation}
                  />
                </CardHeader>
                <div className={styles.useTags}>
                  <span className={styles.smallTags}>Search</span>
                  <span className={styles.smallTags}>
                    Custom Content Hydration
                  </span>
                </div>
                <CardContent>
                  <p>{headlessResponse.custom.about}</p>

                  <Divider />
                  <p>
                    Custom endpoints can be created from the Code Editor. Open
                    the code editor, click the create button, select "Custom
                    Endpoint" from the dropdown, make the filename a full path
                    like /my/custom/endpoint.json
                  </p>
                  <Divider />
                  <AppLink to={`/code`} title="Edit Code">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CodeIcon />}
                    >
                      Open Code App
                    </Button>
                  </AppLink>
                </CardContent>
              </Card>
              {props.item.web.path && (
                <Card className={styles.customCard}>
                  <CardHeader className={styles.cardHeader}>
                    <h2>
                      <FontAwesomeIcon icon={faNewspaper} />
                      VisualLayout
                    </h2>
                    <Docs subject="Visual Layout" />
                  </CardHeader>
                  <div className={styles.useTags}>
                    <span className={styles.smallTags}>Automation Design</span>
                    <span className={styles.smallTags}>
                      Content Experiences
                    </span>
                  </div>
                  <CardContent>
                    <p>
                      Visual layout is accessible from rendered HTML or
                      structured JSON from the{" "}
                      <Link
                        href={`${previewURL}${toJSONPath}`}
                        underline="none"
                        color="secondary"
                        target="_blank"
                      >
                        {previewURL}
                        {toJSONPath}
                      </Link>{" "}
                      endpoint via the object path [meta.layout.json] or
                      [meta.layout.html]. To use Visual Layout in your React
                      project, view the{" "}
                      <Link
                        underline="none"
                        color="secondary"
                        href="https://www.npmjs.com/package/@zesty-io/react-autolayout"
                        target="_blank"
                      >
                        <FontAwesomeIcon icon={faNpm} /> React Auto Layout
                        Package
                      </Link>
                      .{" "}
                    </p>

                    <Divider />
                    <p>
                      Visual layout is controlled from the{" "}
                      <Link
                        href="https://parsley.zesty.io/pvl/demo.html"
                        underline="none"
                        color="secondary"
                      >
                        Visual Layout Tool
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
