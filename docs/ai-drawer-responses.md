# AI drawer response types

The drawer renders a list of `ChatResponse` entries (`src/shell/components/AIDrawer/ChatThread.tsx`). Entries come from three places: the server's stored `response`, the client parsing it, and the host app (drawer or Studio).

## Where they come from

`GET /api/chats/:chatZuid` (zesty-io/mcp-remote) returns prompts, each with `prompt` and `response`. The server saves `response` as `JSON.stringify(actions)`. `normalizeChatSessionLog` (`index.tsx`) runs it through `toChatResponses` (`parseResponse.ts`), which also handles legacy records saved as plain text.

| Type                | Origin                                          | Meaning                                                                                                           |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `USER_INPUT`        | Client, from `prompt`                           | The user's prompt.                                                                                                |
| `SET_VALUE`         | Server (text and image flows)                   | Content for the field `payload.refKey`. Gets the Apply button.                                                    |
| `SYSTEM_OUTPUT`     | Server (text flow)                              | A message from the model. Also the fallback when the model doesn't call `respond`.                                |
| `NAVIGATE`          | Server (block flow only)                        | Opens `payload.path`, e.g. the new block.                                                                         |
| `SYSTEM_SUGGESTION` | Model, when prompted by `systemInstructions.ts` | A clickable follow-up prompt.                                                                                     |
| `MESSAGE`           | Client (`parseResponse.ts`)                     | Prose that isn't a valid action: legacy or malformed records. The current backend sends prose as `SYSTEM_OUTPUT`. |
| `ERROR`             | Client                                          | A failed request, or an entry with an unrenderable shape.                                                         |
| `CODE_EDIT`         | Host (Studio)                                   | Line counts for an applied code edit.                                                                             |
| `NOTICE`            | Host (Studio)                                   | A status line, e.g. changes discarded.                                                                            |

## Notes

- The server's action schema (`UI_ACTIONS_SCHEMA` in mcp-remote `src/client/constants.ts`) only enumerates `SET_VALUE` and `SYSTEM_OUTPUT`. `NAVIGATE` comes from the block tool's own output.
- `approval` (`"0"` pending, `"1"` applied, `"-1"` rejected) is per prompt, copied onto each parsed entry.
- `NAVIGATE` reads `payload.path`. Every other type reads `payload.value`.
- Keep this table and the `ChatResponse` comments in sync when adding a type.
