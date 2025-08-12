export default () => {
  const isContentOneDomain = window.location.hostname.includes(".content.one");

  if (isContentOneDomain) {
    const COOKIE_DOMAIN = ".content.one";

    switch (process.env.NODE_ENV) {
      case "production":
        return {
          URL_MANAGER: ".cms.content.one",
          COOKIE_DOMAIN,
        };

      case "stage":
        return {
          URL_MANAGER: ".cms.stage.content.one",
          COOKIE_DOMAIN,
        };

      case "development":
        return {
          URL_MANAGER: ".cms.dev.content.one:8080",
          COOKIE_DOMAIN,
        };

      case "local":
        return {
          URL_MANAGER: ".cms.local.content.one:9000",
          COOKIE_DOMAIN,
        };

      default:
        throw new Error(`Invalid NODE_ENV value: ${process.env.NODE_ENV}`);
    }
  } else {
    const COOKIE_DOMAIN = ".zesty.io";

    switch (process.env.NODE_ENV) {
      case "production":
        return {
          URL_MANAGER: ".manager.zesty.io",
          COOKIE_DOMAIN,
        };

      case "stage":
        return {
          URL_MANAGER: ".manager.stage.zesty.io",
          COOKIE_DOMAIN,
        };

      case "development":
        return {
          URL_MANAGER: ".manager.dev.zesty.io:8080",
          COOKIE_DOMAIN,
        };

      case "local":
        return {
          URL_MANAGER: ".manager.zesty.localdev:9000",
          COOKIE_DOMAIN,
        };

      default:
        throw new Error(`Unhandled NODE_ENV value: ${process.env.NODE_ENV}`);
    }
  }
};
