import Cookies from "js-cookie";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MemoryRouter, Route, Switch } from "react-router";
import { Box, Dialog } from "@mui/material";

import { NotFound } from "shell/components/NotFound";
import { InstallApp } from "../components/InstallApp";

import styles from "./CustomApp.less";
import { IconButton } from "@zesty-io/material";
import { GridCloseIcon } from "@mui/x-data-grid-pro";
import { MediaApp } from "../../../../media/src/app";
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

  const [showZestyDAM, setShowZestyDAM] = useState(false);

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

  const handleZestyDAMRequest = (event) => {
    if (event.data.type === "ZESTY_DAM_REQUEST") {
      setShowZestyDAM(true);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleZestyDAMRequest);
    return () => {
      window.removeEventListener("message", handleZestyDAMRequest);
    };
  }, []);

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
      {showZestyDAM && (
        <MemoryRouter>
          <Dialog
            open
            fullScreen
            sx={{ my: 2.5, mx: 10 }}
            PaperProps={{
              style: {
                borderRadius: "4px",
                overflow: "hidden",
              },
            }}
            onClose={() => setShowZestyDAM(false)}
          >
            <IconButton
              sx={{
                position: "fixed",
                right: 5,
                top: 0,
              }}
              onClick={() => setShowZestyDAM(false)}
            >
              <GridCloseIcon sx={{ color: "common.white" }} />
            </IconButton>
            <MediaApp
              limitSelected={1}
              isSelectDialog={true}
              showHeaderActions={false}
              addImagesCallback={(images) => {
                frame.current.contentWindow.postMessage(
                  {
                    type: "ZESTY_DAM_RESPONSE",
                    source: "zesty",
                    payload: images,
                  },
                  app.url
                );
                setShowZestyDAM(false);
              }}
            />
          </Dialog>
        </MemoryRouter>
      )}
    </Box>
  ) : (
    <NotFound
      message={`The app "${props.match.params.zuid}" is not installed.`}
    />
  );
}
