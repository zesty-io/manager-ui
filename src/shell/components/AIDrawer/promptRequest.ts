import { getRefRegistry } from "../../../engine/refRegistry";
import { suggestionSystemInstruction } from "./systemInstructions";

const TEMPERATURE = 0.5;

type PromptRequestArgs = {
  prompt: string;
  tone: string;
  language: string;
  modelZUID?: string;
  itemZUID?: string;
  roleZUID: string;
  // Omitted to have the /client endpoint start a new chat session.
  chatZUID?: string;
};

// The /client body for a typed prompt: every ref registered on the page,
// plus the open file when a `code-editor` ref is one of them.
export const buildPromptRequest = ({
  prompt,
  tone,
  language,
  modelZUID,
  itemZUID,
  roleZUID,
  chatZUID,
}: PromptRequestArgs) => {
  const registryKeys = Object.keys(getRefRegistry() || {});
  const refRegistry = getRefRegistry();

  return {
    prompt,
    tone,
    language,
    modelZuid: modelZUID,
    itemZuid: itemZUID,
    registryKeys,
    refRegistry: registryKeys.map(
      (x) => `"${x}": "${JSON.stringify(refRegistry[x].context())}"`
    ),
    filename:
      getRefRegistry()?.["code-editor"]?.context()?.fileName || undefined,
    code: getRefRegistry()?.["code-editor"]?.context()?.code || undefined,
    fields: getRefRegistry()?.["code-editor"]?.context()?.fields || undefined,
    temperature: TEMPERATURE,
    url: window.location.href,
    roleZuid: roleZUID,
    ...(chatZUID && { chatZuid: chatZUID }),
  };
};

type SuggestionsRequestArgs = {
  prompt: string;
  chatZUID?: string;
  roleZUID?: string;
};

// The /client body for Generate Suggestions. The role is only needed to
// create a new chat session, when there is no chat yet.
export const buildSuggestionsRequest = ({
  prompt,
  chatZUID,
  roleZUID,
}: SuggestionsRequestArgs) => ({
  prompt,
  systemInstruction: suggestionSystemInstruction(
    Object.keys(getRefRegistry() || {}),
    getRefRegistry()
  ),
  temperature: TEMPERATURE,
  chatZuid: chatZUID,
  url: window.location.href,
  ...(!chatZUID && { roleZuid: roleZUID }),
});
