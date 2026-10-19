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

// Only shapes ChatThread can render get through: NAVIGATE is drawn from
// `payload.path`, every other entry from `payload.value`. A bare scalar is a
// reply. Anything else becomes an ERROR entry rather than reaching the render.
const toChatResponse = (entry: unknown): ChatResponse => {
  if (typeof entry === "string" && entry.trim()) return toMessage(entry);
  if (typeof entry === "number" || typeof entry === "boolean") {
    return toMessage(String(entry));
  }

  if (entry && typeof entry === "object") {
    const { type, payload } = entry as { type?: unknown; payload?: unknown };
    const field = type === "NAVIGATE" ? "path" : "value";
    if (
      typeof type === "string" &&
      payload &&
      typeof payload === "object" &&
      typeof (payload as Record<string, unknown>)[field] === "string"
    ) {
      return entry as ChatResponse;
    }
  }

  return {
    type: "ERROR",
    payload: { value: i18n.t("shell.errorParsingAiResponse") },
  };
};

// A model reply as transcript entries. Blank text is no reply at all.
export const toChatResponses = (rawResponse: unknown): ChatResponse[] => {
  if (typeof rawResponse === "string" && !rawResponse.trim()) return [];

  const decoded =
    typeof rawResponse === "string" ? decodeResponse(rawResponse) : rawResponse;

  return flattenResponses(Array.isArray(decoded) ? decoded : [decoded]).map(
    toChatResponse
  );
};
