import { memo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { resolveMonacoLang, updateFileCode } from "../../../../../store/files";
import { actions } from "shell/store/ui";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
export const MemoizedEditor = memo(
  function MemoizedEditor(props) {
    const dispatch = useDispatch();
    const codeEditorPosition = useSelector(
      (state) => state.ui.codeEditorPosition
    );
    const ref = useRef();

    // use one model per filename and setModel when filename changes
    // this achieves a per-filename undo stack
    useEffect(() => {
      const language = resolveMonacoLang(props.fileName);
      const filenameURI = monaco.Uri.from({
        scheme: "file",
        path: `${props.fileName}`,
        // attach contentModelZUID to monaco model for lookup within completion provider
        query: `contentModelZUID=${props.contentModelZUID}&fileZUID=${props.fileZUID}`,
      });
      const model =
        monaco.editor.getModel(filenameURI) ||
        monaco.editor.createModel(props.code, language, filenameURI);

      ref.current.editor.setModel(model);

      // Bring browser focus to the editor text
      ref.current.editor.focus();

      // Set previous cursor position
      if (codeEditorPosition) {
        ref.current.editor.setPosition(codeEditorPosition);
      }
    }, [props.fileName]);

    useEffect(() => {
      if (!ref.current?.editor) return;
      if (props.code !== ref.current.editor.getValue()) {
        ref.current.editor.getModel().setValue(props.code);
      }
    }, [props.code]);

    return (
      <MonacoEditor
        ref={ref}
        theme="vs-dark"
        options={{
          selectOnLineNumbers: true,
          wordWrap: "on",
        }}
        onChange={(newValue) => {
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
            theme: "parsleyDark",
          });
        }}
        // Set cursor position to state before unmounting
        editorWillUnmount={(editor) =>
          dispatch(actions.setCodeEditorPosition(editor.getPosition()))
        }
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
