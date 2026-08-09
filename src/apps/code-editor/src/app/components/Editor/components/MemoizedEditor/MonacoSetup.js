import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import {
  cssDefaults,
  lessDefaults,
  scssDefaults,
} from "monaco-editor/esm/vs/language/css/monaco.contribution";
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
   * Turn off the automatic worker-backed language features for css/less/scss.
   *
   * Of the CSS worker's twelve methods only `doValidation` null-checks the
   * mirror model; the rest dereference it immediately. Switching files disposes
   * the model one React commit phase after the editor is torn down, so any
   * request still queued at that moment is answered against a document that no
   * longer exists — `Cannot read properties of null (reading 'languageId')`.
   * Cancelling on the main thread cannot prevent it: the adapters ignore their
   * cancellation token, and the message is already posted to the worker.
   *
   * Only the automatic, debounced features can lose that race without the user
   * doing anything: folding (200ms) and word highlighting (250ms). The
   * user-initiated ones stay enabled — completions are worth keeping and need a
   * deliberate keystroke to fire. Hovers, colours, rename, references and code
   * actions are already excluded from the bundle in `webpack.config.js`.
   *
   * These languages fall back to indentation-based folding, so folding still
   * works; it is derived from indentation rather than the CSS parse tree.
   *
   * Must run before any css/less/scss model exists. `setupMode` reads
   * `modeConfiguration` once and — unlike `jsonMode.js` — does not re-register
   * providers on `onDidChange`, so moving this after the first editor mount
   * would make it silently do nothing. `MonacoSetup` runs at shell boot, which
   * guarantees the ordering.
   *
   * Revisit when monaco-editor is upgraded; the guards exist upstream.
   */
  [cssDefaults, lessDefaults, scssDefaults].forEach((defaults) => {
    // Spread rather than assign: all three defaults share one
    // modeConfiguration object, so mutating it would affect the others.
    defaults.setModeConfiguration({
      ...defaults.modeConfiguration,
      foldingRanges: false,
      documentHighlights: false,
    });
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
