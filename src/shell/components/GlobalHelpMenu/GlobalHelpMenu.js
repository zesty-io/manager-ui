import React, { useRef, useEffect } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { toggleHelpMenu } from "shell/store/ui/globalHelpMenu";
import styles from "./styles.less";

const linkMap = {
  content: [
    {
      name: "Content Overview",
      url: "https://zesty.org/services/manager-ui/content"
    },
    {
      name: "Content Entry, Drafts, and Publishing",
      url: "https://zesty.org/guides/content-entry-drafts-and-publishing"
    },
    {
      name: "Adding and Managing Content",
      url:
        "https://zesty.org/services/manager-ui/content/adding-and-managing-content"
    }
  ],
  media: [
    {
      name: "Media Overview",
      url: "https://zesty.org/services/manager-ui/media"
    },
    {
      name: "Adding Image Alt Text",
      url: "https://zesty.org/guides/adding-image-alt-text"
    },
    {
      name: "How to upload multiple images",
      url:
        "https://zesty.org/services/manager-ui/media/how-to-upload-multiple-images"
    }
  ],
  schema: [
    {
      name: "Schema Overview",
      url: "https://zesty.org/services/manager-ui/schema"
    },
    {
      name: "Building The Schema",
      url: "https://zesty.org/guides/building-the-schema-and-selecting-fields"
    },
    {
      name: "Schema, Content, and Code",
      url:
        "https://zesty.org/guides/the-connection-between-schema-content-and-code"
    }
  ],
  code: [
    {
      name: "Code Overview",
      url: "https://zesty.org/services/manager-ui/editor"
    },
    {
      name: "Editor and Coding Basics",
      url: "https://zesty.org/guides/editor-and-coding-basics"
    },
    {
      name: "Schema, Content, and Code",
      url:
        "https://zesty.org/guides/the-connection-between-schema-content-and-code"
    }
  ],
  leads: [
    {
      name: "Leads Overview",
      url: "https://zesty.org/services/manager-ui/leads"
    },
    {
      name: "Creating a Lead Form",
      url: "https://zesty.org/guides/how-to-create-a-lead-form"
    },
    {
      name: "Capturing form data to Leads",
      url:
        "https://zesty.org/services/web-engine/forms-and-form-webhooks#capturing-form-data-to-an-instances-leads-feature"
    }
  ],
  analytics: [
    {
      name: "Analytics Setup",
      url: "https://zesty.org/services/web-engine/analytics"
    },
    {
      name: "Analytics Settings",
      url:
        "https://zesty.org/services/manager-ui/settings/instance-settings#analytics"
    }
  ],
  seo: [
    {
      name: "SEO Overview",
      url: "https://zesty.org/services/manager-ui/health"
    },
    {
      name: "Manage Redirects",
      url: "https://zesty.org/services/manager-ui/health#manage-redirects"
    },
    {
      name: "SEO Redirects",
      url: "https://zesty.org/services/manager-ui/health/redirects"
    }
  ],
  "audit-trail": [
    {
      name: "Audit Trail Overview",
      url: "https://zesty.org/services/manager-ui/audit-trail"
    }
  ],
  settings: [
    {
      name: "Settings Overview",
      url: "https://zesty.org/services/manager-ui/settings"
    },
    {
      name: "Instance Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings"
    }
  ]
};

export default connect(state => {
  return {
    ui: state.ui,
    instance: state.instance
  };
})(function GlobalHelpMenu(props) {
  const section = location.pathname.split("/")[1];
  const links = linkMap[section];
  const ref = useRef(null);

  // close Help Menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        console.log(event);
        console.log(event.target);
        props.dispatch(toggleHelpMenu(false));
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
  return (
    <section
      ref={ref}
      className={cx(
        styles.helpMenu,
        props.ui.helpMenuVisible ? styles.show : styles.hide
      )}
    >
      <header>
        {props.instance.planID && (
          <a target="_blank" href="mailto:support@zesty.io">
            support@zesty.io
          </a>
        )}
        <a target="_blank" href="https://chat.zesty.io">
          chat.zesty.io
        </a>
      </header>

      <div className={styles.helpModules}>
        <div className={cx(styles.helpModule, styles.primary)}>
          <span className={styles.helpModuleTitle}>zesty.org</span>
          <ul className={styles.helpBox}>
            {links.map(link => (
              <li key={link.name}>
                <a target="_blank" href={link.url}>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.helpModule}>
          <span className={styles.helpModuleTitle}>APIs</span>
          <ul className={styles.helpBox}>
            <li>
              <a target="_blank" href="https://instances-api.zesty.org/">
                Instances API
              </a>
            </li>
            <li>
              <a target="_blank" href="https://accounts-api.zesty.org/">
                Accounts API
              </a>
            </li>
            <li>
              <a target="_blank" href="https://auth-api.zesty.org/">
                Auth API
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.helpModule}>
          <span className={styles.helpModuleTitle}>github</span>
          <ul className={styles.helpBox}>
            <li>
              <a target="_blank" href="https://github.com/zesty-io/node-sdk">
                SDK
              </a>
            </li>
            <li>
              <a target="_blank" href="https://github.com/zesty-io/cli">
                CLI
              </a>
            </li>
            <li>
              <a
                target="_blank"
                href="https://github.com/zesty-io/manager-ui/issues/new?assignees=&labels=&template=bug_report.md&title="
              >
                Report a Bug
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
});
