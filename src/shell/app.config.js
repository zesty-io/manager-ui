const pjson = require("./package.json");
let CONFIG = {};
if (process.env.NODE_ENV === "production") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "production",

    API_ACCOUNTS: "https://accounts.api.zesty.io/v1",
    API_INSTANCE: ".api.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",

    CLOUD_FUNCTIONS_DOMAIN: "https://us-central1-zesty-prod.cloudfunctions.net",

    SERVICE_AUTH: "https://auth.api.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://svc.zesty.io/media-manager-service",
    SERVICE_MEDIA_RESOLVER: "https://svc.zesty.io/media-resolver-service",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: ""
    },

    SERVICE_MEDIA_STORAGE: "https://svc.zesty.io/media-storage-service",
    SERVICE_MEDIA_MODIFY: "https://svc.zesty.io/media-modify-service",
    SERVICE_REDIS_GATEWAY: "https://cache.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-prod.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-prod.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.zesty.io",
    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.zesty.io",

    COOKIE_NAME: "APP_SID",
    COOKIE_DOMAIN: ".zesty.io",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk"
  };
} else if (process.env.NODE_ENV === "stage") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "stage",

    API_ACCOUNTS: "https://accounts.api.stage.zesty.io/v1",
    API_INSTANCE: ".api.stage.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",

    CLOUD_FUNCTIONS_DOMAIN:
      "https://us-central1-zesty-stage.cloudfunctions.net",

    SERVICE_AUTH: "https://auth.api.stage.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://stage-svc.zesty.io/media-manager-service",
    SERVICE_MEDIA_RESOLVER: "https://stage-svc.zesty.io/media-resolver-service",
    SERVICE_MEDIA_STORAGE: "https://stage-svc.zesty.io/media-storage-service",
    SERVICE_MEDIA_MODIFY: "https://stage-svc.zesty.io/media-modify-service",
    SERVICE_REDIS_GATEWAY: "https://cache.stage.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-stage.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-stage.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.stage.zesty.io",
    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.stage.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.stage.zesty.io",

    COOKIE_NAME: "STAGE_APP_SID",
    COOKIE_DOMAIN: ".zesty.io",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk"
  };
} else if (process.env.NODE_ENV === "development") {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "development",

    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    API_INSTANCE: ".api.dev.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",

    CLOUD_FUNCTIONS_DOMAIN: "https://us-central1-zesty-dev.cloudfunctions.net",

    SERVICE_AUTH: "https://auth.api.dev.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://media-manager.api.dev.zesty.io",
    SERVICE_MEDIA_RESOLVER: "https://media-resolver.api.dev.zesty.io",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: ""
    },

    SERVICE_MEDIA_STORAGE: "https://media-storage.api.dev.zesty.io",
    SERVICE_MEDIA_MODIFY: "https://media-modify.api.dev.zesty.io",
    SERVICE_REDIS_GATEWAY: "https://cache.dev.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.dev.zesty.io:8080",
    URL_MANAGER_PROTOCOL: "http://",
    URL_PREVIEW: "-dev.preview.dev.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.dev.zesty.io:9001",

    COOKIE_NAME: "DEV_APP_SID",
    COOKIE_DOMAIN: ".zesty.io"
  };
} else {
  CONFIG = {
    VERSION: pjson.version,
    ENV: "local",

    API_ACCOUNTS: "//accounts.api.zesty.localdev:3022/v1",
    API_INSTANCE: ".api.zesty.localdev:3023/v1",
    API_INSTANCE_PROTOCOL: "http://",

    SERVICE_AUTH: "http://auth.api.zesty.localdev:3011",
    SERVICE_EMAIL: "",
    SERVICE_MEDIA_MANAGER:
      "http://svc.zesty.localdev:3005/media-manager-service",
    SERVICE_MEDIA_RESOLVER:
      "http://svc.zesty.localdev:3007/media-resolver-service",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: "http://svc.zesty.localdev:3007/media-resolver-service"
    },

    SERVICE_MEDIA_STORAGE:
      "http://svc.zesty.localdev:3008/media-storage-service",
    SERVICE_REDIS_GATEWAY: "http://redis-gateway.zesty.localdev:3025",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",

    URL_MANAGER: ".manager.zesty.localdev:9000",
    URL_MANAGER_PROTOCOL: "http://",
    URL_PREVIEW: "-dev.preview.zesty.localdev",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.zesty.localdev:9001",

    COOKIE_NAME: "DEV_APP_SID",
    COOKIE_DOMAIN: ".zesty.localdev"
  };
}

module.exports = CONFIG;
