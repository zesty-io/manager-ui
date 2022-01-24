import { useEffect, useRef, useState } from "react";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core/Select";
import { WithLoader } from "@zesty-io/core/WithLoader";
import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { Url } from "@zesty-io/core/Url";
import { CopyButton } from "@zesty-io/core/CopyButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLinkAlt,
  faSync,
  faEllipsisV,
  faMobileAlt,
} from "@fortawesome/free-solid-svg-icons";

import { Meta } from "./components/Meta";
import { JSONPreview } from "./components/JSONPreview";

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
  const [frameLoading, setFrameLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [instance, setInstance] = useState({});
  const [settings, setSettings] = useState([]);
  const [domain, setDomain] = useState(props.domain);
  const [route, setRoute] = useState(props.route || "/");
  const [device, setDevice] = useState("fullscreen");
  const [refresh, setRefresh] = useState(Date.now());

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

          // TODO: add preview CORS support from manager to allow pre-fetch
          // fetch(`${domain}${msg.data.route}`).finally(() =>
          //   setRoute(msg.data.route)
          // );
        }
        if (msg.data.settings) {
          setSettings(msg.data.settings);
        }
        if (msg.data.refresh) {
          setRefresh(Date.now());
        }

        setFrameLoading(true);
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

  /**
   * This functional component is provided to the selected template function
   * It needs to be setup inside the `Preview` component so it can
   * have lexical scope access to it's state
   */
  const iFrame = () => (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <iframe
        key={refresh}
        className={styles.Device}
        src={`${domain}${route}`}
        scrolling="yes"
        frameBorder="0"
      />
    </div>
  );

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
            <figcaption>Active Preview</figcaption>
          </figure>
          <div className={styles.ActionInfo}>
            <div className={styles.Url}>
              <Button
                onClick={() => setRefresh(Date.now())}
                title="Reload current url in active preview"
              >
                <FontAwesomeIcon icon={faSync} />
              </Button>

              <CopyButton
                className={styles.CopyButton}
                value={`${domain}${route}`}
              >
                Preview
              </CopyButton>
              <Input
                ref={input}
                className={styles.Route}
                value={`${domain}${route}`}
              />
            </div>

            <div className={styles.Device}>
              <Button onClick={() => setRotate(!rotate)} title="Rotate device">
                <FontAwesomeIcon
                  icon={faMobileAlt}
                  style={{
                    transform: `rotate(${rotate ? "-90deg" : "0deg"})`,
                  }}
                />
              </Button>
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
            </div>

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
          {!loading && domain && route ? (
            device === "fullscreen" ? (
              route.includes(".json") ? (
                <JSONPreview src={`${domain}${route}`} settings={settings} />
              ) : (
                <iframe
                  key={refresh}
                  className={cx(
                    styles.Frame,
                    frameLoading ? styles.FrameLoading : null
                  )}
                  src={`${domain}${route}`}
                  scrolling="yes"
                  frameBorder="0"
                  onLoad={() => setFrameLoading(false)}
                />
              )
            ) : (
              <div className={styles.center}>
                {templates[device].template({
                  iFrame,
                  orientation: rotate ? "landscape" : "portrait",
                })}
              </div>
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

const templates = {
  NoTemplate: {
    option: "No Template",
    template: () => (
      <div className={styles.NoDomain}>
        <h1 className={styles.headline}>No template selected</h1>
      </div>
    ),
  },

  /**
   * To add a new template
   * 1) copy existing template
   * 2) alter markup to match mobile device
   * 3) change object key and name references to new model
   */
  Iphone5: {
    option: `<span>iPhone 5 <small>320x568px</small></span>`,
    template: (props) => {
      return (
        <div className={`marvel-device iphone5s silver ${props.orientation}`}>
          <div className="top-bar"></div>
          <div className="sleep"></div>
          <div className="volume"></div>
          <div className="camera"></div>
          <div className="sensor"></div>
          <div className="speaker"></div>
          <div className="screen">{props.iFrame()}</div>
          <div className="home"></div>
          <div className="bottom-bar"></div>
        </div>
      );
    },
  },
  Iphone8: {
    option: `<span>iPhone 8 <small>375x667px</small></span>`,
    template: (props) => (
      <div className={`marvel-device iphone8 black ${props.orientation}`}>
        <div className="top-bar"></div>
        <div className="sleep"></div>
        <div className="volume"></div>
        <div className="camera"></div>
        <div className="sensor"></div>
        <div className="speaker"></div>
        <div className="screen">{props.iFrame()}</div>
        <div className="home"></div>
        <div className="bottom-bar"></div>
      </div>
    ),
  },
  IphoneX: {
    option: `<span>iPhone X <small>375x812px</small></span>`,
    template: (props) => (
      <div className={`marvel-device iphone-x ${props.orientation}`}>
        <div className="notch">
          <div className="camera"></div>
          <div className="speaker"></div>
        </div>
        <div className="top-bar"></div>
        <div className="sleep"></div>
        <div className="bottom-bar"></div>
        <div className="volume"></div>
        <div className="overflow">
          <div className="shadow shadow--tr"></div>
          <div className="shadow shadow--tl"></div>
          <div className="shadow shadow--br"></div>
          <div className="shadow shadow--bl"></div>
        </div>
        <div className="inner-shadow"></div>
        <div className="screen">{props.iFrame()}</div>
      </div>
    ),
  },
  iPadMini: {
    option: `<span>iPad Mini <small>576x768px</small></span>`,
    template: (props) => (
      <div className={`marvel-device ipad silver ${props.orientation}`}>
        <div className="camera"></div>
        <div className="screen">{props.iFrame()}</div>
        <div className="home"></div>
      </div>
    ),
  },
  Note8: {
    option: `<span>Note 8 <small>400x822px</small></span>`,
    template: (props) => (
      <div className={`marvel-device note8 ${props.orientation}`}>
        <div className="inner"></div>
        <div className="overflow">
          <div className="shadow"></div>
        </div>
        <div className="speaker"></div>
        <div className="sensors"></div>
        <div className="more-sensors"></div>
        <div className="sleep"></div>
        <div className="volume"></div>
        <div className="camera"></div>
        <div className="screen">{props.iFrame()}</div>
      </div>
    ),
  },
  Nexus5: {
    option: `<span>Nexus 5 <small>320x568px</small></span>`,
    template: (props) => (
      <div class={`marvel-device nexus5 ${props.orientation}`}>
        <div class="top-bar"></div>
        <div class="sleep"></div>
        <div class="volume"></div>
        <div class="camera"></div>
        <div class="screen">{props.iFrame()}</div>
      </div>
    ),
  },
  HTCOne: {
    option: `<span>HTCOne <small>320x568px</small></span>`,
    template: (props) => (
      <div class={`marvel-device htc-one ${props.orientation}`}>
        <div class="top-bar"></div>
        <div class="camera"></div>
        <div class="sensor"></div>
        <div class="speaker"></div>
        <div class="screen">{props.iFrame()}</div>
      </div>
    ),
  },
  Lumina920: {
    option: `<span>Lumina 920 <small>320x553px</small></span>`,
    template: (props) => (
      <div class={`marvel-device lumia920 black ${props.orientation}`}>
        <div class="top-bar"></div>
        <div class="volume"></div>
        <div class="camera"></div>
        <div class="speaker"></div>
        <div class="screen">{props.iFrame()}</div>
      </div>
    ),
  },
};
