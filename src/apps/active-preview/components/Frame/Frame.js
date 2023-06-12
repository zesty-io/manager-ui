import { Fragment, useState, useEffect } from "react";
import cx from "classnames";

import iphone14 from "../../../../../public/images/iphone-14.png";
import iphone14cam from "../../../../../public/images/iphone-14-camera.png";
import iphone14pro from "../../../../../public/images/iphone-14-pro.png";
import iphone14proCam from "../../../../../public/images/iphone-14-pro-camera.png";
import ipad from "../../../../../public/images/ipad.png";
import pixel7 from "../../../../../public/images/pixel-7.png";
import pixel7cam from "../../../../../public/images/pixel-7-camera.png";

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
        <>
          {templates[props.device].template({
            isLandscape: props.rotate,
            partial: () => {
              return (
                <div
                  className={cx(
                    styles.iframeContainer,
                    props.rotate ? styles.landscape : styles.portrait,
                    styles[props.device]
                  )}
                  style={{
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
        </>
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
          style={{
            backgroundImage: `url('${iphone14}')`,
            backgroundRepeat: "no-repeat",
            // Width needs to be the same as the height on landscape so that device image is not cut off
            width: props.isLandscape ? "883px" : "437px",
            height: "883px",
            margin: "auto",
            transform: props.isLandscape
              ? "rotate(-90deg) translateX(40%)"
              : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        >
          <div
            className={styles.screen}
            style={{
              width: "389px",
              height: "842px",
              padding: "21px 0 0 24px",
            }}
          >
            <img
              className={styles.camera}
              src={iphone14cam}
              style={{
                left: "132px",
                top: "19px",
              }}
            />
            <div
              className={styles.webContent}
              style={{
                borderRadius: "47px",
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
          style={{
            backgroundImage: `url('${iphone14pro}')`,
            backgroundRepeat: "no-repeat",
            // Width needs to be the same as the height on landscape so that device image is not cut off
            width: props.isLandscape ? "883px" : "434px",
            height: "883px",
            margin: "auto",
            transform: props.isLandscape
              ? "rotate(-90deg) translateX(40%)"
              : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        >
          <div
            className={styles.screen}
            style={{
              padding: "19px 0 0 22px",
              width: "390px",
              height: "845px",
            }}
          >
            <img
              className={styles.camera}
              src={iphone14proCam}
              style={{
                left: "154px",
                top: "30px",
              }}
            />
            <div
              className={styles.webContent}
              style={{
                borderRadius: "53px",
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
          style={{
            backgroundImage: `url('${ipad}')`,
            backgroundRepeat: "no-repeat",
            // Width needs to be the same as the height on landscape so that device image is not cut off
            width: props.isLandscape ? "1494px" : "1158px",
            height: "1494px",
            margin: "auto",
            transform: props.isLandscape
              ? "rotate(-90deg) translateX(20%)"
              : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        >
          <div
            className={styles.screen}
            style={{
              width: "1027px",
              height: "1367px",
              overflow: "hidden",
              padding: "50px 0 0 46px",
            }}
          >
            <div
              className={styles.webContent}
              style={{
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
          style={{
            backgroundImage: `url('${pixel7}')`,
            backgroundRepeat: "no-repeat",
            // Width needs to be the same as the height on landscape so that device image is not cut off
            width: props.isLandscape ? "1373px" : "648px",
            height: "1373px",
            margin: "auto",
            transform: props.isLandscape
              ? "rotate(-90deg) translateX(40%)"
              : "rotate(0deg)",
            transition: "transform 200ms",
          }}
        >
          <div
            className={styles.screen}
            style={{
              padding: "25px 0 0 13px",
              height: "1322px",
              width: "617px",
            }}
          >
            <img
              className={styles.camera}
              src={pixel7cam}
              style={{
                left: "306px",
                top: "37px",
              }}
            />
            <div
              className={styles.webContent}
              style={{
                borderRadius: "25px",
              }}
            >
              {props.partial()}
            </div>
          </div>
        </div>
      );
    },
  },
};
