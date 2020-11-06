import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { tokenizer, languageConf } from "./parsley-tokens";
import { ParsleyTheme } from "./parsley-theme";

// register parsley language, tokenizer, theme and completions
// we do this in a separate step before react render so that it only happens once
export function MonacoSetup(store) {
  monaco.languages.register({
    id: "parsley"
  });

  monaco.languages.setMonarchTokensProvider("parsley", {
    tokenizer
  });

  monaco.languages.setLanguageConfiguration("parsley", languageConf);

  monaco.editor.defineTheme("parsleyDark", {
    base: "vs-dark", // can also be vs-dark or hc-black
    inherit: true, // can also be false to completely replace the builtin rules
    rules: ParsleyTheme
  });

  /**
   * Completion function is registered once at startup but needs dynamic access to:
   * 1) the current file's contentModelZUID (set via model in the MemoizedEditor)
   * 2) the latest fields loaded into the store
   */
  monaco.languages.registerCompletionItemProvider("parsley", {
    triggerCharacters: ["."],
    provideCompletionItems: model => {
      // Pull the contentModelZUID attached to the specific file model
      const query = new URLSearchParams(model.uri.query);

      // Use reference to store to get latet state to ensure we have all fields to filter by
      const state = store.getState();
      const fields = Object.values(state.fields);
      const modelFields = fields.filter(
        field => field.contentModelZUID === query.get("contentModelZUID")
      );

      return {
        suggestions: modelFields.map(field => {
          return {
            label: field.name,
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: `${field.description}`,
            detail: field.label,
            insertText: field.name
          };
        })
      };
    }
  });
}
