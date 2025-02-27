import { useEffect, useRef, useState } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";

const Editor = ({
  options,
  onChange,
  attributes,
  nodeViews,
  autoFocus,
  render,
  modals,
}) => {
  const editorRef = useRef(null);
  const [view, setView] = useState(null);

  useEffect(() => {
    const editorView = new EditorView(null, {
      state: EditorState.create(options),
      dispatchTransaction: (transaction) => {
        const { state, transactions } =
          editorView.state.applyTransaction(transaction);
        editorView.updateState(state);

        if (transactions.some((tr) => tr.docChanged) && onChange) {
          onChange(state.doc);
        }
      },
      attributes,
      nodeViews,
    });

    setView(editorView);

    return () => {
      if (editorView) {
        editorView.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (view && editorRef.current) {
      const element = editorRef.current;
      if (view.dom) {
        element.appendChild(view.dom);

        if (autoFocus) {
          view.focus();
        }
      }
    }
  }, [view, autoFocus]);

  useEffect(() => {
    if (view) {
      view.updateState(EditorState.create(options));
    }
  }, [options]);

  const editor = <div ref={editorRef} id="editorRef" />;

  return render && view
    ? render({
        editor,
        view,
      })
    : editor;
};

export default Editor;
