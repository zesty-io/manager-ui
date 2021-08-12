import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { registerFrame } from "shell/store/apps";

import styles from "./VendorApp.less";
export default function VendorApp() {
  const dispatch = useDispatch();
  const instance = useSelector((state) => state.instance);
  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));
  const frame = useRef();

  // TODO handle multiple apps
  // TODO handle registered app url
  const src = `http://${window.location.hostname}:3000`;

  // console.log("VendorApp", instance);

  useEffect(() => {
    if (frame.current) {
      dispatch(registerFrame(frame.current));

      frame.current.addEventListener("load", () => {
        // Send users session into frame on load
        frame.current?.contentWindow.postMessage(
          {
            source: "zesty",
            sessionToken,
            instance,
            payload: {},
          },
          src
        );
      });
    }
  }, [frame.current]);

  return (
    <main className={cx(styles.VendorApp)}>
      <iframe src={src} ref={frame}></iframe>
    </main>
  );
}
