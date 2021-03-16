import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

// window.CONFIG not available so we use the webpack injected variable
if (["stage", "production"].includes(__CONFIG__?.ENV)) {
  Sentry.init({
    release: __CONFIG__?.build?.data?.gitCommit,
    environment: __CONFIG__?.ENV,
    integrations: [
      new Integrations.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV5Instrumentation(history)
      })
    ],
    dsn:
      "https://2e83c3767c484794a56832affe2d26d9@o162121.ingest.sentry.io/5441698",
    autoSessionTracking: true,
    tracesSampleRate: 1.0,
    normalizeDepth: 10 // increases depth of redux state tree sent
  });
}

export { Sentry, history };
