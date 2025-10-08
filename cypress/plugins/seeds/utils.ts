import SDK from "@zesty-io/sdk";

const sdkCache = new Map();
let authToken = null;

export async function getAuthToken(config) {
  const auth = new SDK.Auth({ authURL: config.env.SERVICE_AUTH });
  let isValidToken = true;

  if (authToken) {
    const tokenStatus = await auth.verifyToken(authToken);
    isValidToken = !!tokenStatus?.verified;
  }

  if (!authToken || !isValidToken) {
    authToken = await auth
      .login(config.env.email, config.env.password)
      .then((res) => {
        if (!res?.token) {
          throw new Error("Authentication failed: No token received");
        }
        return res.token;
      })
      .catch((error) => {
        authToken = null;
        throw new Error(`Authentication error: ${error.message}`);
      });
  }

  return authToken;
}

export async function getSDK(config) {
  const cacheKey = config.env.INSTANCE_ZUID;

  if (!sdkCache.has(cacheKey)) {
    const token = await getAuthToken(config);

    const sdkInstance = new SDK(config.env.INSTANCE_ZUID, token, {
      accountsAPIURL: config.env.API_ACCOUNTS,
      authURL: config.env.SERVICE_AUTH,
      instancesAPIURL: config.env.API_INSTANCE_URL,
      mediaAPIURL: config.env.SERVICE_MEDIA_MANAGER,
    });

    sdkCache.set(cacheKey, sdkInstance);
  }

  return sdkCache.get(cacheKey);
}
