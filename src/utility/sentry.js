import * as Sentry from "@sentry/react";
import { spanToJSON } from "@sentry/core";
import history from "utility/history";

// Endpoints confirmed as non-issues — required for UI rendering
const N1_IGNORED_ENDPOINTS = [
  /\/v1\/search\/items/,
  // This endpoint is currently added in the allow list but should ideally be updated to a batch api call
  /accounts\.api\.zesty\.io\/v1\/instances\/[^/]+\/comments/,
  /\/v1\/content\/models\/[^/]+\/items/,
];

// window.CONFIG not available so we use the webpack injected variable
if (["stage", "production"].includes(__CONFIG__?.ENV)) {
  Sentry.init({
    release: __CONFIG__?.build?.data?.gitCommit,
    environment: __CONFIG__?.ENV,
    integrations: [Sentry.reactRouterV5BrowserTracingIntegration({ history })],
    dsn: "https://2e83c3767c484794a56832affe2d26d9@o162121.ingest.sentry.io/5441698",
    autoSessionTracking: true,
    tracesSampleRate: 1.0,
    normalizeDepth: 10, // increases depth of redux state tree sent
    maxBreadcrumbs: 50, // reduce for performance purposes
    beforeBreadcrumb: (breadcrumb, hint) => {
      if (
        hint?.event?.target &&
        (breadcrumb.category === "ui.click" ||
          breadcrumb.category === "ui.input")
      ) {
        const target = hint.event.target;
        const elementType = target.tagName.toLowerCase();
        const dataCy = target.dataset?.cy;
        const messages = [];

        if (elementType) {
          messages.push(`Tag name: "${elementType}"`);
        }

        if (dataCy) {
          messages.push(`data-cy: "${dataCy}"`);
        }

        if (target.id) {
          messages.push(`ID: "${target.id}"`);
        }

        if (target.name) {
          messages.push(`Input Name: "${target.name}"`);
        }

        if (elementType === "button" && target.textContent) {
          messages.push(`Button Text: "${target.textContent.trim()}"`);
        }

        // Messages needs to be more than 1 since every interaction would have a tag name by default
        // but if there are no other relevant attributes then only having the tag name info
        // is not that helpful in determining what was exactly being interacted by the user
        if (messages.length > 1) {
          breadcrumb.message = messages.join("\n");

          return breadcrumb;
        }

        // Return default breadcrumb data
        return breadcrumb;
      }

      // Return default breadcrumb data if the event is not a click or input event
      return breadcrumb;
    },
    beforeSendTransaction(event) {
      const isIgnoredN1 = event.spans?.some((span) => {
        const { op, description } = spanToJSON(span);
        return (
          op === "http.client" &&
          N1_IGNORED_ENDPOINTS.some((pattern) =>
            pattern.test(description ?? "")
          )
        );
      });

      if (isIgnoredN1) return null;

      return event;
    },
  });
}

export { Sentry };
