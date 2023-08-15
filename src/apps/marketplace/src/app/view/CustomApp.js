import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router";
import { Box } from "@mui/material";

import { NotFound } from "shell/components/NotFound";
import { InstallApp } from "../components/InstallApp";

import styles from "./CustomApp.less";
export default function CustomApp() {
  return (
    <main className={cx(styles.CustomApp)}>
      <Switch>
        <Route exact path="/apps" render={InstallApp} />
        <Route exact path="/apps/:zuid" component={LoadApp} />
      </Switch>
    </main>
  );
}

function LoadApp(props) {
  const dispatch = useDispatch();
  const frame = useRef();
  const app = useSelector((state) =>
    state.apps.installed.find((app) => app.ZUID === props.match.params.zuid)
  );

  const instance = useSelector((state) => state.instance);
  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));

  useEffect(() => {
    if (frame.current) {
      // TODO need too rethink this. The goal was to allow posting messages from other locations within core
      // but if not handled properly the reference to the frame could be a memory leak
      // dispatch(registerFrame({
      //   zuid: app.zuid,
      //   frame: frame.current
      // }));

      frame.current.addEventListener("load", () => {
        // Send users session into frame on load
        frame.current?.contentWindow.postMessage(
          {
            source: "zesty",
            sessionToken,
            instance,
            payload: {},
          },
          app.url
        );
      });
    }
  }, [frame.current, app]);

  return app ? (
    <Box className={styles.IframeContainer}>
      <iframe
        src={app.url}
        key={app.ZUID}
        ref={frame}
        frameBorder="0"
        allow="clipboard-write"
        scrolling="yes"
      ></iframe>
    </Box>
  ) : (
    <NotFound
      message={`The app "${props.match.params.zuid}" is not installed.`}
    />
  );
}
