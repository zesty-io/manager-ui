import * as Sentry from "@sentry/react";

Sentry.init({
  release: window.CONFIG?.build?.data?.gitCommit,
  environment: window.CONFIG?.ENV,
  dsn:
    "https://2e83c3767c484794a56832affe2d26d9@o162121.ingest.sentry.io/5441698"
});

export default Sentry;
