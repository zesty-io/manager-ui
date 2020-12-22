import React, { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { resolveMonacoLang, updateFileCode } from "../../../../../store/files";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
export const MemoizedEditor = React.memo(
  function MemoizedEditor(props) {
    const ref = useRef();

    // use one model per filename and setModel when filename changes
    // this achieves a per-filename undo stack
    useEffect(() => {
      const language = resolveMonacoLang(props.fileName);
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

          editor.updateOptions({
            theme: "parsleyDark"
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
