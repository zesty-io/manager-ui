import SDK from "@zesty-io/sdk";

const sdkCache = new Map();
let tokenPromise = null;

export async function getAuthToken(config) {
  if (!tokenPromise) {
    const auth = new SDK.Auth({ authURL: config.env.API_AUTH });

    tokenPromise = auth
      .login(config.env.email, config.env.password)
      .then((res) => {
        if (!res?.token) {
          throw new Error("Authentication failed: No token received");
        }
        return res.token;
      })
      .catch((error) => {
        tokenPromise = null;
        throw new Error(`Authentication error: ${error.message}`);
      });
  }

  return tokenPromise;
}

export async function getSDK(config) {
  const cacheKey = config.env.INSTANCE_ZUID;

  if (!sdkCache.has(cacheKey)) {
    const token = await getAuthToken(config);

    const sdkInstance = new SDK(config.env.INSTANCE_ZUID, token, {
      accountsAPIURL: config.env.API_ACCOUNTS,
      authURL: config.env.API_AUTH,
      instancesAPIURL: config.env.API_INSTANCE_URL,
      mediaAPIURL: config.env.MEDIA_MANAGER_URL,
    });

    sdkCache.set(cacheKey, sdkInstance);
  }

  return sdkCache.get(cacheKey);
}
