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

export function lookupValue(
  jsonData: any,
  context: Record<string, any> = {}
): any {
  if (!jsonData) {
    return jsonData;
  }
  const jsonString =
    typeof jsonData !== "string" ? JSON.stringify(jsonData) : jsonData;
  const safeContext = context || {};

  const replaced = jsonString.replace(/{{(.*?)}}/g, (_, expr) => {
    try {
      const trimmedExpr = expr.trim();
      if (!trimmedExpr) {
        return `{{${expr}}}`;
      }
      const resolveExpression = (expr: string, ctx: any) => {
        if (expr.includes("?.")) {
          const parts = expr.split("?.");
          let current = ctx;

          for (const part of parts) {
            if (current == null) return undefined;
            if (part.startsWith("[") && part.endsWith("]")) {
              const index = parseInt(part.slice(1, -1), 10);
              current = current[index];
            } else {
              current = current[part];
            }
          }
          return current;
        }
        return new Function(...Object.keys(ctx), `return ${expr}`)(
          ...Object.values(ctx)
        );
      };
      const result = resolveExpression(trimmedExpr, safeContext);
      return result !== undefined ? result : `{{${expr}}}`;
    } catch (err) {
      return `{{${expr}}}`;
    }
  });

  return JSON.parse(replaced);
}
