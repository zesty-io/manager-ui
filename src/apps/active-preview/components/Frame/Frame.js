import { Fragment, useState, useEffect } from "react";
import cx from "classnames";

import iphone14 from "../../../../../public/images/iphone-14.png";
import iphone14pro from "../../../../../public/images/iphone-14-pro.png";
import ipad from "../../../../../public/images/ipad.png";
import pixel7 from "../../../../../public/images/pixel-7.png";

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
  iphone14: {
    option: (
      <span>
        iPhone 14 <small>437x883</small>
      </span>
    ),
    template: (props) => {
      return (
        <div
          className={props.orientation}
          style={{
            backgroundImage: `url('${iphone14}')`,
            backgroundRepeat: "no-repeat",
            width: "437px",
            height: "883px",
          }}
        >
          <div
            className={styles.screen}
            style={{ width: "389px", height: "842px", margin: "21px 0 0 24px" }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "47px 47px 47px 47px",
                overflow: "hidden",
              }}
            >
              {props.partial()}
            </div>
          </div>
        </div>
      );
    },
  },
  iphone14pro: {
    option: (
      <span>
        iPhone 14 Pro <small>434x883</small>
      </span>
    ),
    template: (props) => {
      return (
        <div
          className={props.orientation}
          style={{
            backgroundImage: `url('${iphone14pro}')`,
            backgroundRepeat: "no-repeat",
            width: "434px",
            height: "883px",
          }}
        >
          <div
            className={styles.screen}
            style={{
              margin: "19px 0 0 22px",
              width: "390px",
              height: "845px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "53px",
                overflow: "hidden",
              }}
            >
              {props.partial()}
            </div>
          </div>
        </div>
      );
    },
  },
  ipad: {
    option: (
      <span>
        iPad Pro <small>1158x1494</small>
      </span>
    ),
    template: (props) => {
      return (
        <div
          className={props.orientation}
          style={{
            backgroundImage: `url('${ipad}')`,
            backgroundRepeat: "no-repeat",
            width: "1158px",
            height: "1494px",
          }}
        >
          <div
            className={styles.screen}
            style={{
              width: "1027px",
              height: "1367px",
              overflow: "hidden",
              margin: "50px 0 0 46px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: "100%",
                borderRadius: "22px",
              }}
            >
              {props.partial()}
            </div>
          </div>
        </div>
      );
    },
  },
  pixel7: {
    option: (
      <span>
        Pixel 7 <small>648x1373</small>
      </span>
    ),
    template: (props) => {
      return (
        <div
          className={props.orientation}
          style={{
            backgroundImage: `url('${pixel7}')`,
            backgroundRepeat: "no-repeat",
            width: "648px",
            height: "1373px",
          }}
        >
          <div className={styles.screen}>{props.partial()}</div>
        </div>
      );
    },
  },
};
