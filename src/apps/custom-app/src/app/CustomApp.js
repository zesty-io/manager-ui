import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router";

import { registerFrame } from "shell/store/apps";
import { NotFound } from "shell/components/NotFound";

import { Card, CardHeader, CardContent } from "@zesty-io/core/Card";
import { Search } from "@zesty-io/core/Search";

import Link from "@mui/material/Link";

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
    <section className={styles.InstallApp}>
      <header className={styles.Filter}>
        <h1 className={styles.display}>Find an application: </h1>
        <Search />
      </header>

      <main className={styles.Grid}>
        <Card className={styles.Register}>
          <CardHeader>
            <h1 className={styles.display}>Custom Applications</h1>
          </CardHeader>
          <CardContent>
            <ol className={styles.subheadline}>
              <li>
                <Link
                  color="secondary"
                  underline="none"
                  href="https://github.com/zesty-io/app-custom-guide"
                >
                  Build an application
                </Link>
              </li>
              <li>Register an application</li>
              <li>Install an application</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h1 className={styles.display}>Content Composer</h1>
          </CardHeader>
          <CardContent>
            <figure>
              <img src="" />
            </figure>
            <p>Create dynamic layouts.</p>
          </CardContent>
        </Card>
      </main>
    </section>
  );
}
