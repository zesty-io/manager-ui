import i18n from "shell/i18n";
import type { ChatResponse } from "./ChatThread";

const toMessage = (value: string): ChatResponse => ({
  type: "MESSAGE",
  payload: { value },
});

// The model answers with an action array, usually ```json-fenced and
// sometimes double-encoded, or with prose. Prose is a reply, not a parse
// failure, so whatever text fails to parse comes back as a string. Capped at
// 3 passes: enough for normal, fenced, and double-encoded payloads.
const decodeResponse = (rawResponse: string): unknown => {
  let parsed: unknown = rawResponse;

  for (let i = 0; i < 3 && typeof parsed === "string"; i++) {
    const cleaned = parsed.replace(/```json|```/g, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return cleaned;
    }
  }

  return parsed;
};

// The model sometimes wraps the response array as a JSON string inside a
// single item's `payload.value`; unwrap it so each entry renders on its own.
const flattenResponses = (items: unknown[]): unknown[] =>
  items.flatMap((item) => {
    const value = (item as { payload?: { value?: unknown } })?.payload?.value;
    if (typeof value !== "string" || !value.trim().startsWith("[")) {
      return [item];
    }

    const nested = decodeResponse(value);
    const isResponseArray =
      Array.isArray(nested) &&
      nested.length > 0 &&
      nested.every((entry) => typeof entry?.type === "string");

    return isResponseArray ? flattenResponses(nested) : [item];
  });

const isScalar = (value: unknown): value is number | boolean =>
  typeof value === "number" || typeof value === "boolean";

// Only shapes ChatThread can render get through: NAVIGATE is drawn from
// `payload.path`, every other entry from `payload.value`. A bare scalar is a
// reply, and a scalar SET_VALUE is the text it sets. Anything else becomes an
// ERROR entry rather than reaching the render.
const toChatResponse = (entry: unknown): ChatResponse => {
  if (typeof entry === "string" && entry.trim()) return toMessage(entry);
  if (isScalar(entry)) return toMessage(String(entry));

  if (entry && typeof entry === "object") {
    const { type, payload } = entry as { type?: unknown; payload?: unknown };
    if (typeof type === "string" && payload && typeof payload === "object") {
      const fields = payload as Record<string, unknown>;
      if (type === "SET_VALUE" && isScalar(fields.value)) {
        return {
          ...entry,
          payload: { ...fields, value: String(fields.value) },
        } as ChatResponse;
      }

      const field = type === "NAVIGATE" ? "path" : "value";
      if (typeof fields[field] === "string") return entry as ChatResponse;
    }
  }

  return {
    type: "ERROR",
    payload: { value: i18n.t("shell.errorParsingAiResponse") },
  };
};

// A model reply as transcript entries. Null or blank text is no reply at all.
export const toChatResponses = (rawResponse: unknown): ChatResponse[] => {
  if (rawResponse == null) return [];
  if (typeof rawResponse === "string" && !rawResponse.trim()) return [];

  const decoded =
    typeof rawResponse === "string" ? decodeResponse(rawResponse) : rawResponse;

  return flattenResponses(Array.isArray(decoded) ? decoded : [decoded]).map(
    toChatResponse
  );
};
