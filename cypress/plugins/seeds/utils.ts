const SDK = require("@zesty-io/sdk");

// Dev auth sessions expire when idle; `/verify` extends them. One verify a
// minute is plenty against an idle TTL measured in tens of minutes, and it
// spares the several `getSDK` calls a single seed task makes in a row.
const VERIFY_INTERVAL_MS = 60 * 1000;

const sdkCache = new Map();
const lastVerifiedAt = new Map();
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

export function resetAuthToken() {
  tokenPromise = null;
}

async function isTokenValid(config, token) {
  try {
    const auth = new SDK.Auth({ authURL: config.env.API_AUTH });
    const res = await auth.verifyToken(token);
    return !!res?.verified;
  } catch {
    // A failed verify is treated as an expired token: a re-login costs one
    // request, while a dead token fails every seed call after it.
    return false;
  }
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
    lastVerifiedAt.set(cacheKey, Date.now());
    return sdkInstance;
  }

  const sdk = sdkCache.get(cacheKey);

  if (Date.now() - (lastVerifiedAt.get(cacheKey) ?? 0) < VERIFY_INTERVAL_MS) {
    return sdk;
  }

  if (!(await isTokenValid(config, sdk.token))) {
    resetAuthToken();
    // `init` rebinds `sdk.token` and rebuilds the instance/account/media
    // services, so callers reading `sdk.token` directly get the new one too.
    sdk.init(await getAuthToken(config));
  }

  lastVerifiedAt.set(cacheKey, Date.now());
  return sdk;
}
