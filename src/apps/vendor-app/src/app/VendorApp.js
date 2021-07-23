import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";

import styles from "./VendorApp.less";
export default connect((state) => {
  return {};
})(function VendorApp(props) {
  console.log("VendorApp", props);

  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));
  const frame = useRef();
  const src = "http://localhost:3000";

  useEffect(() => {
    if (frame.current) {
      frame.current.addEventListener("load", () => {
        // Send users session into frame on load
        frame.current.contentWindow.postMessage(
          {
            source: "zesty",
            sessionToken,
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
});
