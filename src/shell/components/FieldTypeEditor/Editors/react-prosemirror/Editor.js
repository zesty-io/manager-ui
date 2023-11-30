import React from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import "prosemirror-view/style/prosemirror.css";

export default class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.editorRef = React.createRef();
  }

  componentWillMount() {
    this.view = new EditorView(null, {
      state: EditorState.create(this.props.options),
      dispatchTransaction: (transaction) => {
        const { state, transactions } =
          this.view.state.applyTransaction(transaction);
        this.view.updateState(state);

        if (transactions.some((tr) => tr.docChanged) && this.props.onChange) {
          this.props.onChange(state.doc);
        }

        this.forceUpdate();
      },
      attributes: this.props.attributes,
      nodeViews: this.props.nodeViews,
    });
  }

  componentDidMount() {
    this.editorRef.current.appendChild(this.view.dom);

    if (this.props.autoFocus) {
      this.view.focus();
    }
  }

  componentWillUnmount() {
    if (this.view) {
      this.view.destroy();
      this.view = null;
    }
  }

  shouldComponentUpdate(nextProps) {
    // NOTE: If prosemirror options have changed
    // trigger prosemirrors internal document update
    if (nextProps.options !== this.props.options) {
      this.view.updateState(EditorState.create(nextProps.options));
    }

    // NOTE: if modals are provided and their display state changes, re-render
    if (nextProps.modals && this.props.modals) {
      if (
        nextProps.modals.showEmbedModal !== this.props.modals.showEmbedModal ||
        nextProps.modals.showLinkModal !== this.props.modals.showLinkModal
      ) {
        return true;
      }
    }

    return false;
  }

  render() {
    const editor = <div ref={this.editorRef} />;

    return this.props.render && this.view
      ? this.props.render({
          editor,
          view: this.view,
        })
      : editor;
  }
}
