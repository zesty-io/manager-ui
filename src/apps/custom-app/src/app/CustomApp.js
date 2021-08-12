import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router";

import { registerFrame } from "shell/store/apps";
import { NotFound } from "shell/components/NotFound";
import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";

import styles from "./CustomApp.less";
export default function CustomApp() {
  return (
    <main className={cx(styles.CustomApp)}>
      <Switch>
        <Route path="/apps" render={InstallApp} />
        <Route path="/app/:zuid" component={LoadApp} />
      </Switch>
    </main>
  );
}

function LoadApp(props) {
  const dispatch = useDispatch();
  const frame = useRef();
  const app = useSelector((state) =>
    state.apps.installed.find((app) => app.zuid === props.match.params.zuid)
  );
  const instance = useSelector((state) => state.instance);
  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));

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
          app.url
        );
      });
    }
  }, [frame.current]);

  return app ? (
    <iframe src={app.url} ref={frame}></iframe>
  ) : (
    <NotFound
      message={`The app "${props.match.params.zuid}" is not installed.`}
    />
  );
}

function InstallApp() {
  return (
    <section>
      <Card>
        <CardHeader>
          <h1 className={styles.display}>Install a Custom Application</h1>
        </CardHeader>
        <CardContent>
          <ol>
            <li>Register your application</li>
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
