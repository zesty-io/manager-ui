import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

// window.CONFIG not available so we use the webpack injected variable
if (["stage", "production"].includes(__CONFIG__?.ENV)) {
  Sentry.init({
    release: __CONFIG__?.build?.data?.gitCommit,
    environment: __CONFIG__?.ENV,
    integrations: [new Integrations.BrowserTracing()],
    dsn:
      "https://2e83c3767c484794a56832affe2d26d9@o162121.ingest.sentry.io/5441698",
    autoSessionTracking: true,
    sampleRate: 1.0
  });
}

export default Sentry;
