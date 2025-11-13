import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { tokenizer, languageConf } from "./parsley-tokens";
import { ParsleyTheme } from "./parsley-theme";

// register parsley language, tokenizer, theme and completions
// we do this in a separate step before react render so that it only happens once
export function MonacoSetup(store) {
  monaco.languages.register({
    id: "parsley",
  });

  monaco.languages.setMonarchTokensProvider("parsley", {
    tokenizer,
  });

  monaco.languages.setLanguageConfiguration("parsley", languageConf);

  monaco.editor.defineTheme("parsleyDark", {
    base: "vs-dark", // can also be vs-dark or hc-black
    inherit: true, // can also be false to completely replace the builtin rules
    rules: ParsleyTheme,
  });

  /**
   * Completion function is registered once at startup but needs dynamic access to:
   * 1) the current file's contentModelZUID (set via model in the MemoizedEditor)
   * 2) the latest fields loaded into the store
   */
  monaco.languages.registerCompletionItemProvider("parsley", {
    triggerCharacters: ["."],
    provideCompletionItems: (model, position) => {
      const state = store.getState();

      const prevWord = model.getWordAtPosition({
        lineNumber: position.lineNumber,
        column: Math.max(1, position.column - 1),
      })?.word;

      let fields = [];

      if (prevWord === "globals") {
        // globals.<field> → use the globals model (clippings)
        const globalsModel = Object.values(state.models).find(
          (m) => m.name === "clippings"
        );
        if (!globalsModel) return { suggestions: [] };
        fields = Object.values(state.fields).filter(
          (f) => f.contentModelZUID === globalsModel.ZUID
        );
      } else {
        // <model>.<field> → use the current file's contentModelZUID from the model URI
        const query = new URLSearchParams(model.uri.query);
        const contentModelZUID = query.get("contentModelZUID");
        fields = Object.values(state.fields).filter(
          (f) => f.contentModelZUID === contentModelZUID
        );
      }

      return {
        suggestions: fields.map((f) => ({
          label: f.name,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: f.name,
          documentation: f.description || "",
          detail: f.label || "",
        })),
      };
    },
  });
}
