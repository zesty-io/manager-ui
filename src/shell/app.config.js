const pkg = require("../../package.json");
module.exports = {
  production: {
    VERSION: pkg.version,
    ENV: "production",

    API_ACCOUNTS: "https://accounts.api.zesty.io/v1",
    API_METRICS: "https://metrics.api.zesty.io",
    API_INSTANCE: ".api.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",
    API_ANALYTICS: "https://analytics.api.zesty.io",

    CLOUD_FUNCTIONS_DOMAIN: "https://us-central1-zesty-prod.cloudfunctions.net",
    INSTANCE_SCREENSHOTS_BUCKET: "zesty-prod-instance-screenshots",
    MCP_DOMAIN: "https://mcp.content.one",

    SERVICE_AUTH: "https://auth.api.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://media-manager.api.zesty.io",
    SERVICE_MEDIA_RESOLVER: "https://media-resolver.api.zesty.io",
    SERVICE_MEDIA_STORAGE: "https://media-storage.api.zesty.io",
    SERVICE_MEDIA_MODIFY: "https://media-modify.api.zesty.io",
    SERVICE_REDIS_GATEWAY: "https://cache.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-prod.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-prod.cloudfunctions.net/googleAnalyticsGetPageViews",
    SERVICE_INSTANCE_INSTALLER: "https://installer-xytrmaqk4a-uc.a.run.app",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: "",
    },

    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.webengine.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://zesty.io",
    URL_MARKETPLACE: "https://zesty.io/marketplace/apps/",
    URL_APPS: "https://apps.zesty.io",

    COOKIE_NAME: "APP_SID",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk",

    TIME_DISPLAY_FORMAT: "MMMM Do YYYY, [at] h:mm a",
    TIME_UTC_FORMAT: "YYYY-MM-DD HH:mm:ss",

    MARKETING_INSTANCE_DOMAIN: "https://www.zesty.io/",
    MARKETING_ANNOUNCEMENT_MODEL_ZUID: "6-90fbdcadfc-4lc0s5",
    AMPLITUDE_API_KEY: "7054515be52d21916740cd82f5a00d2b",
  },
  stage: {
    VERSION: pkg.version,
    ENV: "stage",

    API_ACCOUNTS: "https://accounts.api.stage.zesty.io/v1",
    API_METRICS: "https://metrics.api.stage.zesty.io",
    API_INSTANCE: ".api.stage.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",
    API_ANALYTICS: "https://analytics.api.stage.zesty.io",

    CLOUD_FUNCTIONS_DOMAIN:
      "https://us-central1-zesty-stage.cloudfunctions.net",
    INSTANCE_SCREENSHOTS_BUCKET: "zesty-stage-instance-screenshots",
    MCP_DOMAIN: "https://mcp-remote-109811026457.us-central1.run.app",

    SERVICE_AUTH: "https://auth.api.stage.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://media-manager.api.stage.zesty.io",
    SERVICE_MEDIA_RESOLVER: "https://media-resolver.api.stage.zesty.io",
    SERVICE_MEDIA_STORAGE: "https://media-storage.api.stage.zesty.io",
    SERVICE_MEDIA_MODIFY: "https://media-modify.api.stage.zesty.io",
    SERVICE_REDIS_GATEWAY: "https://cache.stage.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-stage.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-stage.cloudfunctions.net/googleAnalyticsGetPageViews",
    SERVICE_INSTANCE_INSTALLER: "https://installer-m3rbwjxm5q-uc.a.run.app",

    URL_MANAGER_PROTOCOL: "https://",
    URL_PREVIEW: "-dev.preview.stage.zesty.io",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.stage.zesty.io",
    URL_MARKETPLACE:
      "https://kfg6bckb-dev.webengine.zesty.io/marketplace/apps/",
    URL_APPS: "https://apps-beta.zesty.io",

    COOKIE_NAME: "STAGE_APP_SID",

    GOOGLE_WEB_FONTS_KEY: "AIzaSyD075qEo9IXa4BPsSZ_YJGWlTw34T51kuk",

    TIME_DISPLAY_FORMAT: "MMMM Do YYYY, [at] h:mm a",
    TIME_UTC_FORMAT: "YYYY-MM-DD HH:mm:ss",

    MARKETING_INSTANCE_DOMAIN: "https://kfg6bckb-dev.preview.stage.zesty.io/",
    MARKETING_ANNOUNCEMENT_MODEL_ZUID: "6-90fbdcadfc-4lc0s5",
    AMPLITUDE_API_KEY: "7054515be52d21916740cd82f5a00d2b",
  },
  development: {
    VERSION: pkg.version,
    ENV: "development",

    API_ACCOUNTS: "https://accounts.api.dev.zesty.io/v1",
    API_METRICS: "https://metrics.api.dev.zesty.io",
    API_INSTANCE: ".api.dev.zesty.io/v1",
    API_INSTANCE_PROTOCOL: "https://",
    API_ANALYTICS: "https://analytics-api-m3rbwjxm5q-uc.a.run.app",

    CLOUD_FUNCTIONS_DOMAIN: "https://us-central1-zesty-dev.cloudfunctions.net",
    INSTANCE_SCREENSHOTS_BUCKET: "zesty-dev-instance-screenshots",
    MCP_DOMAIN: "https://mcp-remote-387953501748.us-central1.run.app",

    SERVICE_AUTH: "https://auth.api.dev.zesty.io",
    SERVICE_EMAIL: "https://email.zesty.io/send",
    SERVICE_MEDIA_MANAGER: "https://media-manager.api.dev.zesty.io",
    SERVICE_MEDIA_RESOLVER: "https://media-resolver.api.dev.zesty.io",
    SERVICE_MEDIA_STORAGE: "https://media-storage.api.dev.zesty.io",
    SERVICE_MEDIA_MODIFY: "https://media-modify.api.dev.zesty.io",
    SERVICE_REDIS_GATEWAY: "https://cache.dev.zesty.io",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",
    SERVICE_INSTANCE_INSTALLER: "https://installer-m3rbwjxm5q-uc.a.run.app",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: "",
    },

    URL_MANAGER_PROTOCOL: "http://",
    URL_PREVIEW: "-dev.preview.dev.zesty.io",
    URL_PREVIEW_PROTOCOL: "http://",
    URL_ACCOUNTS: "https://zesty.io",
    URL_MARKETPLACE:
      "https://kfg6bckb-dev.webengine.zesty.io/marketplace/apps/",
    URL_APPS: "https://apps-beta.zesty.io",

    COOKIE_NAME: "DEV_APP_SID",

    TIME_DISPLAY_FORMAT: "MMMM Do YYYY, [at] h:mm a",
    TIME_UTC_FORMAT: "YYYY-MM-DD HH:mm:ss",

    MARKETING_INSTANCE_DOMAIN: "https://kfg6bckb-dev.preview.stage.zesty.io/",
    MARKETING_ANNOUNCEMENT_MODEL_ZUID: "6-90fbdcadfc-4lc0s5",
    AMPLITUDE_API_KEY: "7054515be52d21916740cd82f5a00d2b",
  },
  local: {
    VERSION: pkg.version,
    ENV: "local",

    API_ACCOUNTS: "//accounts.api.zesty.localdev:3022/v1",
    API_INSTANCE: ".api.zesty.localdev:3023/v1",
    API_INSTANCE_PROTOCOL: "http://",
    API_ANALYTICS: "https://analytics-api-m3rbwjxm5q-uc.a.run.app",

    CLOUD_FUNCTIONS_DOMAIN: "https://us-central1-zesty-dev.cloudfunctions.net",
    MCP_DOMAIN: "https://mcp-remote-387953501748.us-central1.run.app",

    SERVICE_AUTH: "http://auth.api.zesty.localdev:3011",
    SERVICE_EMAIL: "",
    SERVICE_MEDIA_MANAGER:
      "http://svc.zesty.localdev:3005/media-manager-service",
    SERVICE_MEDIA_RESOLVER:
      "http://svc.zesty.localdev:3007/media-resolver-service",
    SERVICE_MEDIA_STORAGE:
      "http://svc.zesty.localdev:3008/media-storage-service",
    SERVICE_REDIS_GATEWAY: "http://redis-gateway.zesty.localdev:3025",
    SERVICE_GOOGLE_ANALYTICS_AUTH:
      "https://us-central1-zesty-dev.cloudfunctions.net/authenticateGoogleAnalytics",
    SERVICE_GOOGLE_ANALYTICS_READ:
      "https://us-central1-zesty-dev.cloudfunctions.net/googleAnalyticsGetPageViews",
    SERVICE_INSTANCE_INSTALLER: "https://installer-m3rbwjxm5q-uc.a.run.app",

    // FIXME: This is a workaround to solve for the FieldTypeImage dependence on this object path reference
    service: {
      media_resolver: "http://svc.zesty.localdev:3007/media-resolver-service",
    },

    URL_MANAGER_PROTOCOL: "http://",
    URL_PREVIEW: "-dev.preview.zesty.localdev",
    URL_PREVIEW_PROTOCOL: "https://",
    URL_ACCOUNTS: "https://accounts.zesty.localdev:9001",

    COOKIE_NAME: "DEV_APP_SID",

    TIME_DISPLAY_FORMAT: "MMMM Do YYYY, [at] h:mm a",
    TIME_UTC_FORMAT: "YYYY-MM-DD HH:mm:ss",

    MARKETING_INSTANCE_DOMAIN: "https://kfg6bckb-dev.preview.stage.zesty.io/",
    MARKETING_ANNOUNCEMENT_MODEL_ZUID: "6-90fbdcadfc-4lc0s5",
    AMPLITUDE_API_KEY: "",
  },
};
