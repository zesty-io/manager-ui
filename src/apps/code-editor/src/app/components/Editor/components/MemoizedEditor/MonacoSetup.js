import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { tokenizer, languageConf } from "./parsley-tokens";
import { ParsleyTheme } from "./parsley-theme";

export function MonacoSetup(store) {
  // Register Parsley syntax and theme
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
   * Language registration happens once on mount.
   * Due to this we have to maintain references in the closure
   * to the two items need to map the appropriate fields to the current file
   * 1) the current files contentModelZUID
   * 2) the latest fields loaded into the stoer
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
