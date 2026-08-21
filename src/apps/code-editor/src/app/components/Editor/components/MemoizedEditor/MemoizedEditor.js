import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MonacoEditor from "react-monaco-editor";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { Box } from "@mui/material";

import { resolveMonacoLang, updateFileCode } from "../../../../../store/files";
import { actions } from "shell/store/ui";
import { useRegisterRef } from "../../../../../../../../engine/useRegisterRef";
import { useResizeObserver } from "../../../../../../../../shell/hooks/useResizeObserver";

/**
 * We memoize this component because we need to short circuit the redux->react->component update cycle
 * This is done for performance reasons. Constantly re-rendering slows down the editor typing experience.
 * But we still want to broadcast store updates `onChange`
 */
export const MemoizedEditor = memo(
  function MemoizedEditor(props) {
    const dispatch = useDispatch();
    const containerRef = useRef(null);
    const dimensions = useResizeObserver(containerRef);
    const codeEditorPosition = useSelector(
      (state) => state.ui.codeEditorPosition
    );
    const ref = useRef();

    // use one model per filename and setModel when filename changes
    // this achieves a per-filename undo stack
    useEffect(() => {
      if (ref.current) {
        const language = resolveMonacoLang(props.fileName);
        const filenameURI = monaco.Uri.from({
          scheme: "file",
          path: `${props.fileName}`,
          // attach contentModelZUID to monaco model for lookup within completion provider
          query: `contentModelZUID=${props.contentModelZUID}&fileZUID=${props.fileZUID}`,
        });
        let model = monaco.editor.getModel(filenameURI);

        if (!model) {
          model = monaco.editor.createModel(props.code, language, filenameURI);
        }

        ref.current.editor.setModel(model);

        // Bring browser focus to the editor text
        ref.current.editor.focus();

        // Restore previous cursor position
        if (codeEditorPosition?.[props.fileZUID]) {
          ref.current.editor.setPosition(codeEditorPosition[props.fileZUID]);
        }

        // Saves cursor position to the store on file change
        return () => {
          if (ref.current) {
            dispatch(
              actions.setCodeEditorPosition({
                ...codeEditorPosition,
                [props.fileZUID]: ref.current.editor.getPosition(),
              })
            );
          }
          if (model && !model.isDisposed()) {
            model.dispose();
          }
        };
      }
    }, [props.fileName]);

    useEffect(() => {
      if (ref.current) {
        if (props.code !== ref.current.editor.getValue()) {
          ref.current.editor.getModel().setValue(props.code);
        }
      }
    }, [props.code]);

    const handle = useMemo(
      () => ({
        setValue: (val) => {
          if (ref.current) {
            ref.current.editor.getModel().setValue(val);
          }
        },
      }),
      []
    );

    useRegisterRef("code-editor", handle, () => ({
      fileName: props.fileName,
      code: ref.current?.editor.getValue() || props.code,
      fields: props.fields,
    }));

    // Manually handle monaco editor resizing instead of relying on MonacoEditor's
    // `automaticLayout` as it causes a lot of ResizeObserver loop errors
    // when rapidly resizing the window
    useEffect(() => {
      if (ref.current && dimensions) {
        ref.current.editor.layout({
          width: dimensions.width,
          height: dimensions.height,
        });
      }
    }, [dimensions]);

    return (
      <Box
        ref={containerRef}
        width="100%"
        height="100%"
        data-cy="code-app-editor-container"
      >
        <MonacoEditor
          ref={ref}
          theme="vs-dark"
          options={{
            scrollBeyondLastLine: false,
            selectOnLineNumbers: true,
            wordWrap: "on",
            padding: {
              top: 10,
              bottom: 10,
            },
          }}
          onChange={(newValue) => {
            props.setCode(newValue);
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
          // Save cursor position to store before unmounting
          editorWillUnmount={(editor) => {
            dispatch(
              actions.setCodeEditorPosition({
                ...codeEditorPosition,
                [props.fileZUID]: editor.getPosition(),
              })
            );
          }}
        />
      </Box>
    );
  },
  (prev, next) => {
    if (prev.fileZUID !== next.fileZUID) {
      return false;
    }
    return true;
  }
);
