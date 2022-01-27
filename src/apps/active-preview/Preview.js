import { useEffect, useRef, useState } from "react";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core/Select";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { Url } from "@zesty-io/core/Url";
import { CopyButton } from "@zesty-io/core/CopyButton";
import { Notice } from "@zesty-io/core/Notice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faSync,
  faEllipsisV,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";

import { Meta } from "./components/Meta";
import { JSONPreview } from "./components/JSONPreview";
import { Frame, templates } from "./components/Frame";

import api from "./api";

import styles from "./Preview.less";
import "./device.min.css";
export function Preview(props) {
  const ZUID = window.location.host.split(".")[0];
  if (!ZUID) {
    throw new Error("Invalid host for active preview");
  }

  const input = useRef();

  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [open, setOpen] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [instance, setInstance] = useState({});
  const [settings, setSettings] = useState([]);
  const [domain, setDomain] = useState(props.domain);
  const [route, setRoute] = useState(props.route || "/");
  const [device, setDevice] = useState("fullscreen");
  const [refresh, setRefresh] = useState(Date.now());
  const [version, setVersion] = useState(0);
  const [dirty, setDirty] = useState(false);

  // Track initial version sent. We use this to make a determination
  // on whether current content has changed or the different version was
  // picked for previewing
  const [initialVersion, setInitialVersion] = useState(props.version);

  // Listen for messages
  useEffect(() => {
    function receiveMessage(msg) {
      // Prevent malicious communication to this window
      if (msg.origin !== window.location.origin) {
        console.error("Origin mismatch");
        return;
      }

      if (msg.data.source === "zesty") {
        if (msg.data.route) {
          setRoute(msg.data.route);
        }
        if (msg.data.settings) {
          setSettings(msg.data.settings);
        }
        if (msg.data.refresh) {
          setRefresh(Date.now());
        }
        if (msg.data.dirty) {
          setDirty(msg.data.dirty);
        }
        if (msg.data.version) {
          setVersion(msg.data.version);
          if (!initialVersion) {
            setInitialVersion(msg.data.version);
          }
        }
      }
    }

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [domain]);

  // fetch domain
  useEffect(() => {
    api(`${CONFIG.API_ACCOUNTS}/instances/${ZUID}`)
      .then((json) => {
        setInstance(json.data);
        setDomain(
          `${CONFIG.URL_PREVIEW_PROTOCOL}${json.data.randomHashID}${CONFIG.URL_PREVIEW}`
        );
      })
      .catch((err) => {
        if (err.message === "unauthenticated") {
          setAuthenticated(false);
          setDomain("");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <WithLoader condition={domain} message="Finding Domain" height="100vh">
      <section className={styles.ActivePreview}>
        <header className={styles.TopBar}>
          <figure className={styles.Logo}>
            <img
              height="20px"
              width="20px"
              src="https://brand.zesty.io/zesty-io-logo-dark.svg"
            />
            &nbsp;
            <figcaption>ActivePreview</figcaption>
          </figure>
          <div className={styles.ActionInfo}>
            {instance.domain && (
              <Url
                className={styles.Live}
                href={`//${instance.domain}${route}`}
                target="_blank"
                title="Open live link in standard browser window"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;Live
              </Url>
            )}

            <div className={styles.Url}>
              <CopyButton
                className={styles.CopyButton}
                value={`${domain}${route}`}
              >
                Preview
              </CopyButton>
              <Button
                onClick={() => setRefresh(Date.now())}
                title="Reload current url in ActivePreview"
              >
                <FontAwesomeIcon icon={faSync} />
              </Button>
              <Input
                ref={input}
                className={styles.Route}
                value={`${domain}${route}`}
              />
            </div>

            <div className={styles.Device}>
              <Select
                className={styles.Select}
                name="device"
                value="fullscreen"
                onSelect={(val) => setDevice(val)}
              >
                <Option value="fullscreen" text="Viewport" />

                {/*
            Generate available options from templates,
            except the initial "No Template" template
            */}
                {Object.keys(templates)
                  .slice(1)
                  .map((template, index) => (
                    <Option
                      key={index}
                      value={template}
                      html={templates[template].option}
                    />
                  ))}
              </Select>
              <Button onClick={() => setRotate(!rotate)} title="Rotate device">
                <FontAwesomeIcon
                  icon={faMobileAlt}
                  style={{
                    transform: `rotate(${rotate ? "-90deg" : "0deg"})`,
                  }}
                />
              </Button>
            </div>

            <div className={styles.Menu}>
              <Button
                onClick={() => setOpen(!open)}
                title="Additional menu options"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Button>
              <Meta open={open} route={route} instanceZUID={ZUID} />
            </div>
          </div>
        </header>
        <main
          className={cx(
            styles.Preview,
            device !== "fullscreen" ? styles.Mobile : null
          )}
        >
          {initialVersion === version && dirty && (
            <div className={styles.Overlay}>
              <Notice>Save to update preview</Notice>
            </div>
          )}

          {!loading && domain && route ? (
            route.includes(".json") ? (
              <JSONPreview src={`${domain}${route}`} settings={settings} />
            ) : (
              <Frame
                key={refresh}
                device={device}
                domain={domain}
                route={route}
                rotate={rotate}
                blur={initialVersion === version && dirty}
              />
            )
          ) : (
            <div className={styles.NoDomain}>
              <h1 className={styles.headline}>
                {!authenticated
                  ? "Your session is not active. Please login to Zesty.io"
                  : "Disconnected from preview domain"}
              </h1>
            </div>
          )}
        </main>
      </section>
    </WithLoader>
  );
}
