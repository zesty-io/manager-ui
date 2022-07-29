import { Fragment, useState, useEffect, useRef } from "react";
import cx from "classnames";

import styles from "./Frame.less";
export function Frame(props) {
  const [frameLoading, setFrameLoading] = useState(true);

  useEffect(() => {
    setFrameLoading(true);
  }, [props.device]);

  return (
    <Fragment>
      {props.device === "fullscreen" ? (
        <iframe
          className={cx(
            styles.Frame,
            props.blur ? styles.Blur : null,
            frameLoading ? styles.FrameLoading : null
          )}
          src={`${props.domain}${props.route}`}
          scrolling="yes"
          frameBorder="0"
          onLoad={() => setFrameLoading(false)}
        />
      ) : (
        <div className={styles.center}>
          {templates[props.device].template({
            orientation: props.rotate ? "landscape" : "portrait",
            partial: () => {
              return (
                <div
                  style={{
                    height: "100%",
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <iframe
                    className={cx(
                      styles.Frame,
                      props.blur ? styles.Blur : null,
                      frameLoading ? styles.FrameLoading : null,
                      styles.Device
                    )}
                    src={`${props.domain}${props.route}`}
                    scrolling="yes"
                    frameBorder="0"
                    onLoad={() => setFrameLoading(false)}
                  />
                </div>
              );
            },
          })}
        </div>
      )}
    </Fragment>
  );
}

export const templates = {
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
    option: (
      <span>
        iPhone 5 <small>320x568px</small>
      </span>
    ),
    template: (props) => {
      return (
        <div className={`marvel-device iphone5s silver ${props.orientation}`}>
          <div className="top-bar"></div>
          <div className="sleep"></div>
          <div className="volume"></div>
          <div className="camera"></div>
          <div className="sensor"></div>
          <div className="speaker"></div>
          <div className="screen">{props.partial()}</div>
          <div className="home"></div>
          <div className="bottom-bar"></div>
        </div>
      );
    },
  },
  Iphone8: {
    option: (
      <span>
        iPhone 8 <small>375x667px</small>
      </span>
    ),
    template: (props) => (
      <div className={`marvel-device iphone8 black ${props.orientation}`}>
        <div className="top-bar"></div>
        <div className="sleep"></div>
        <div className="volume"></div>
        <div className="camera"></div>
        <div className="sensor"></div>
        <div className="speaker"></div>
        <div className="screen">{props.partial()}</div>
        <div className="home"></div>
        <div className="bottom-bar"></div>
      </div>
    ),
  },
  IphoneX: {
    option: (
      <span>
        iPhone X <small>375x812px</small>
      </span>
    ),
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
        <div className="screen">{props.partial()}</div>
      </div>
    ),
  },
  iPadMini: {
    option: (
      <span>
        iPad Mini <small>576x768px</small>
      </span>
    ),
    template: (props) => (
      <div className={`marvel-device ipad silver ${props.orientation}`}>
        <div className="camera"></div>
        <div className="screen">{props.partial()}</div>
        <div className="home"></div>
      </div>
    ),
  },
  Note8: {
    option: (
      <span>
        Note 8 <small>400x822px</small>
      </span>
    ),
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
        <div className="screen">{props.partial()}</div>
      </div>
    ),
  },
  Nexus5: {
    option: (
      <span>
        Nexus 5 <small>320x568px</small>
      </span>
    ),
    template: (props) => (
      <div className={`marvel-device nexus5 ${props.orientation}`}>
        <div className="top-bar"></div>
        <div className="sleep"></div>
        <div className="volume"></div>
        <div className="camera"></div>
        <div className="screen">{props.partial()}</div>
      </div>
    ),
  },
  HTCOne: {
    option: (
      <span>
        HTCOne <small>320x568px</small>
      </span>
    ),
    template: (props) => (
      <div className={`marvel-device htc-one ${props.orientation}`}>
        <div className="top-bar"></div>
        <div className="camera"></div>
        <div className="sensor"></div>
        <div className="speaker"></div>
        <div className="screen">{props.partial()}</div>
      </div>
    ),
  },
  Lumina920: {
    option: (
      <span>
        Lumina 920 <small>320x553px</small>
      </span>
    ),
    template: (props) => (
      <div className={`marvel-device lumia920 black ${props.orientation}`}>
        <div className="top-bar"></div>
        <div className="volume"></div>
        <div className="camera"></div>
        <div className="speaker"></div>
        <div className="screen">{props.partial()}</div>
      </div>
    ),
  },
};
