import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useStore } from "react-redux";
import { resolveMonacoLang, updateFileCode } from "../../../../../store/files";

import { tokenizer, languageConf } from "./parsley-tokens";
import { ParsleyTheme } from "./parsley-theme";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
export const MemoizedEditor = React.memo(
  function MemoizedEditor(props) {
    const store = useStore();
    const ref = useRef();
    const language = resolveMonacoLang(props.fileName);

    // use one model per filename and setModel when filename changes
    // this achieves a per-filename undo stack
    useEffect(() => {
      const filenameURI = monaco.Uri.from({
        scheme: "file",
        path: `${props.fileName}`,
        // attach contentModelZUID to monaco model for lookup within completion provider
        query: `contentModelZUID=${props.contentModelZUID}&fileZUID=${props.fileZUID}`
      });
      const model =
        monaco.editor.getModel(filenameURI) ||
        monaco.editor.createModel(props.code, language, filenameURI);

      ref.current.editor.setModel(model);
    }, [props.fileName]);

    return (
      <MonacoEditor
        ref={ref}
        theme="vs-dark"
        language={language}
        options={{
          selectOnLineNumbers: true,
          wordWrap: "on"
        }}
        onChange={newValue => {
          props.dispatch(
            updateFileCode(props.fileZUID, props.status, newValue)
          );
        }}
        editorDidMount={(editor, monaco) => {
          // Line number linking feature
          if (Number(props.lineNumber)) {
            editor.revealLineInCenter(Number(props.lineNumber));
            editor.setSelection(
              new monaco.Selection(
                Number(props.lineNumber),
                0,
                Number(props.lineNumber),
                1000
              )
            );
          } else {
            editor.setSelection(new monaco.Selection(1, 0, 1, 0));
          }

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

          editor.updateOptions({
            theme: "parsleyDark"
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
                field =>
                  field.contentModelZUID === query.get("contentModelZUID")
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
        }}
      />
    );
  },
  (prev, next) => {
    if (prev.fileZUID !== next.fileZUID) {
      return false;
    }
    return true;
  }
);
