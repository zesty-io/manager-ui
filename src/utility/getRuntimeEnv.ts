export default () => {
  const isContentOneDomain =
    window.location.hostname.includes(".cms.content.one");

  if (isContentOneDomain) {
    switch (process.env.NODE_ENV) {
      case "production":
        return {
          URL_MANAGER: ".cms.content.one",
          COOKIE_DOMAIN: ".content.one",
        };

      case "stage":
        return {
          URL_MANAGER: ".stage.cms.content.one",
          COOKIE_DOMAIN: ".content.one",
        };

      case "development":
        return {
          URL_MANAGER: ".dev.cms.content.one:8080",
          COOKIE_DOMAIN: ".content.one",
        };

      case "local":
        return {
          URL_MANAGER: ".local.cms.content.one:9000",
          COOKIE_DOMAIN: ".content.one",
        };

      default:
        break;
    }
  } else {
    switch (process.env.NODE_ENV) {
      case "production":
        return {
          URL_MANAGER: ".manager.zesty.io",
          COOKIE_DOMAIN: ".zesty.io",
        };

      case "stage":
        return {
          URL_MANAGER: ".manager.stage.zesty.io",
          COOKIE_DOMAIN: ".zesty.io",
        };

      case "development":
        return {
          URL_MANAGER: ".manager.dev.zesty.io:8080",
          COOKIE_DOMAIN: ".zesty.io",
        };

      case "local":
        return {
          URL_MANAGER: ".manager.zesty.localdev:9000",
          COOKIE_DOMAIN: ".zesty.io",
        };

      default:
        break;
    }
  }
};
