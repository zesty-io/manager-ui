import { useRef, useEffect } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faEnvelope } from "@fortawesome/free-solid-svg-icons";

import Link from "@mui/material/Link";

import { Button } from "@zesty-io/core/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import styles from "./styles.less";

const defaultLinks = [
  {
    name: "Introduction",
    url: "https://zesty.org/",
  },
  {
    name: "Getting Started",
    url: "https://zesty.org/getting-started",
  },
  {
    name: "Guides",
    url: "https://zesty.org/guides",
  },
];
const linkMap = {
  content: [
    {
      name: "Content Overview",
      url: "https://zesty.org/services/manager-ui/content",
    },
    {
      name: "Content Entry, Drafts, and Publishing",
      url: "https://zesty.org/guides/content-entry-drafts-and-publishing",
    },
    {
      name: "Adding and Managing Content",
      url: "https://zesty.org/services/manager-ui/content/adding-and-managing-content",
    },
  ],
  media: [
    {
      name: "Media Overview",
      url: "https://zesty.org/services/manager-ui/media",
    },
    {
      name: "Adding Image Alt Text",
      url: "https://zesty.org/guides/adding-image-alt-text",
    },
    {
      name: "How to upload multiple images",
      url: "https://zesty.org/services/manager-ui/media/how-to-upload-multiple-images",
    },
  ],
  schema: [
    {
      name: "Schema Overview",
      url: "https://zesty.org/services/manager-ui/schema",
    },
    {
      name: "Building The Schema",
      url: "https://zesty.org/guides/building-the-schema-and-selecting-fields",
    },
    {
      name: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  code: [
    {
      name: "Code Overview",
      url: "https://zesty.org/services/manager-ui/editor",
    },
    {
      name: "Editor and Coding Basics",
      url: "https://zesty.org/guides/editor-and-coding-basics",
    },
    {
      name: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  leads: [
    {
      name: "Leads Overview",
      url: "https://zesty.org/services/manager-ui/leads",
    },
    {
      name: "Creating a Lead Form",
      url: "https://zesty.org/guides/how-to-create-a-lead-form",
    },
    {
      name: "Capturing form data to Leads",
      url: "https://zesty.org/services/web-engine/forms-and-form-webhooks#capturing-form-data-to-an-instances-leads-feature",
    },
  ],
  analytics: [
    {
      name: "Analytics Setup",
      url: "https://zesty.org/services/web-engine/analytics",
    },
    {
      name: "Analytics Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings#analytics",
    },
  ],
  seo: [
    {
      name: "SEO Overview",
      url: "https://zesty.org/services/manager-ui/health",
    },
    {
      name: "Manage Redirects",
      url: "https://zesty.org/services/manager-ui/health#manage-redirects",
    },
    {
      name: "SEO Redirects",
      url: "https://zesty.org/services/manager-ui/health/redirects",
    },
  ],
  "audit-trail": [
    {
      name: "Audit Trail Overview",
      url: "https://zesty.org/services/manager-ui/audit-trail",
    },
  ],
  settings: [
    {
      name: "Settings Overview",
      url: "https://zesty.org/services/manager-ui/settings",
    },
    {
      name: "Instance Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings",
    },
  ],
};

export default connect((state) => {
  return {
    instance: state.instance,
  };
})(function GlobalHelpMenu(props) {
  const section = location.pathname.split("/")[1];
  const links = section ? linkMap[section] : defaultLinks;
  return (
    <section className={styles.helpMenu}>
      <header>
        {props.instance.planID && (
          <Link
            underline="none"
            color="secondary"
            target="_blank"
            href="mailto:support@zesty.io"
          >
            <Button className={styles.Button} kind="" title="Support">
              <FontAwesomeIcon icon={faEnvelope} />
              support@zesty.io
            </Button>
          </Link>
        )}

        <Link
          underline="none"
          color="secondary"
          target="_blank"
          href="https://chat.zesty.io"
        >
          <Button className={styles.Button} type="alt" title="Chat">
            <FontAwesomeIcon icon={faComments} />
            chat.zesty.io
          </Button>
        </Link>
      </header>

      <div className={styles.helpModules}>
        <Card className={cx(styles.helpModule, styles.primary)}>
          <CardHeader className={styles.subheadline}>
            <Link
              underline="none"
              color="secondary"
              target="_blank"
              href="https://zesty.org/"
            >
              zesty.org
            </Link>
          </CardHeader>
          <CardContent>
            <ul className={styles.helpBox}>
              {links.map((link) => (
                <li key={link.name} className={styles.bodyText}>
                  <Link
                    underline="none"
                    color="secondary"
                    title={link.url}
                    target="_blank"
                    href={link.url}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className={styles.helpModule}>
          <CardHeader className={styles.subheadline}>APIs</CardHeader>
          <CardContent>
            <ul className={styles.helpBox}>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="Instances API"
                  target="_blank"
                  href="https://instances-api.zesty.org/"
                >
                  Instances API
                </Link>
              </li>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="Accounts API"
                  target="_blank"
                  href="https://accounts-api.zesty.org/"
                >
                  Accounts API
                </Link>
              </li>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="Auth API"
                  target="_blank"
                  href="https://auth-api.zesty.org/"
                >
                  Auth API
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className={styles.helpModule}>
          <CardHeader className={styles.subheadline}>github</CardHeader>
          <CardContent>
            <ul className={styles.helpBox}>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="SDK"
                  target="_blank"
                  href="https://github.com/zesty-io/node-sdk"
                >
                  SDK
                </Link>
              </li>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="CLI"
                  target="_blank"
                  href="https://github.com/zesty-io/cli"
                >
                  CLI
                </Link>
              </li>
              <li className={styles.bodyText}>
                <Link
                  underline="none"
                  color="secondary"
                  title="Report a Bug"
                  target="_blank"
                  href="https://github.com/zesty-io/manager-ui/issues/new?assignees=&labels=&template=bug_report.md&title="
                >
                  Report a Bug
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
});
