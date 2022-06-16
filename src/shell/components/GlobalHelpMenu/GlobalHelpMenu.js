import { useRef, useEffect } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import Button from "@mui/material/Button";
import EmailIcon from "@mui/icons-material/Email";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

import Link from "@mui/material/Link";

// import { Card, CardHeader, CardContent, CardFooter } from "@zesty-io/core/Card";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Tooltip from "@mui/material/Tooltip";

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
    <div className={styles.helpMenu}>
      <header>
        {props.instance.planID && (
          <Link
            underline="none"
            color="secondary"
            target="_blank"
            href="mailto:support@zesty.io"
          >
            <Button
              variant="contained"
              title="Support"
              startIcon={<EmailIcon />}
            >
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
          <Button
            variant="contained"
            color="warning"
            title="Chat"
            startIcon={<ContactSupportIcon />}
          >
            chat.zesty.io
          </Button>
        </Link>
      </header>

      <div className={styles.helpModules}>
        <Card>
          <CardHeader
            title={
              <Link
                underline="none"
                color="secondary"
                target="_blank"
                href="https://zesty.org/"
              >
                zesty.org
              </Link>
            }
          ></CardHeader>
          <CardContent sx={{ ml: 2 }}>
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

        <Card>
          <CardHeader title="APIs"> </CardHeader>
          <CardContent sx={{ ml: 2 }}>
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
          <CardHeader title="github"></CardHeader>
          <CardContent sx={{ ml: 2 }}>
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
    </div>
  );
});
