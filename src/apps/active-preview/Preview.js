import { useEffect, useRef, useState } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";
import SyncIcon from "@mui/icons-material/Sync";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MobileScreenShareIcon from "@mui/icons-material/MobileScreenShare";

import { CopyButton } from "@zesty-io/material";

import { Select, Option } from "@zesty-io/core/Select";
import { WithLoader } from "@zesty-io/core/WithLoader";

import { Notice } from "@zesty-io/core/Notice";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faEye } from "@fortawesome/free-solid-svg-icons";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";

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
            <figcaption>
              <Link
                underline="none"
                color="secondary"
                href={`${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}/active-preview`}
                target="_blank"
                title="Open live link in standard browser window"
              >
                ActivePreview
              </Link>
            </figcaption>
          </figure>
          <div className={styles.ActionInfo}>
            <div className={styles.Links}>
              {instance.domain && (
                <Link
                  underline="none"
                  color="secondary"
                  href={`//${instance.domain}${route}`}
                  target="_blank"
                  title="Open live link in standard browser window"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                  &nbsp;Live
                </Link>
              )}
              <Link
                underline="none"
                color="secondary"
                href={`${domain}${route}`}
                target="_blank"
                title="Open preview link in standard browser window"
              >
                <FontAwesomeIcon icon={faEye} />
                &nbsp;Preview
              </Link>
            </div>

            <div className={styles.Url}>
              <CopyButton
                variant="contained"
                value={`${domain}${route}`}
                sx={{
                  mr: 1,
                  svg: {
                    mr: 1,
                  },
                }}
              >
                URL
              </CopyButton>
              <Button
                variant="contained"
                onClick={() => setRefresh(Date.now())}
                title="Reload current url in ActivePreview"
              >
                <SyncIcon fontSize="small" />
              </Button>
              <TextField
                ref={input}
                value={`${domain}${route}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{
                  "@media (max-width: 650px)": {
                    display: "none",
                  },
                }}
                InputProps={{ sx: { flex: 1 } }}
                fullWidth
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
              <Button
                variant="contained"
                onClick={() => setRotate(!rotate)}
                title="Rotate device"
              >
                <MobileScreenShareIcon
                  fontSize="small"
                  sx={{
                    transform: `rotate(${rotate ? "-90deg" : "0deg"})`,
                  }}
                />
              </Button>
            </div>

            <div className={styles.Menu}>
              <Button
                variant="contained"
                onClick={() => setOpen(!open)}
                title="Additional menu options"
              >
                <MoreVertIcon fontSize="small" />
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
