import React, { Fragment } from "react";
import showdown from "showdown";

import { BasicEditor } from "./Editors/Basic.js"; // Covers both WYSIWYGBasic & WYSIWYGAdvanced field types
import { InlineEditor } from "./Editors/Inline.js";
import { MarkdownEditor } from "./Editors/Markdown.js";
import { HtmlEditor } from "./Editors/Html.js";

export const convert = new showdown.Converter({
  noHeaderId: true,
  tables: true,
  strikethrough: true,
  // backslashEscapesHTMLTags: true
});

/**
 * Handle recieving and emitting markdown vs html
 * A markdown field should *always* emit markdown syntax
 * Because the fields editor can be swapped ad-hoc this component has
 * to handle sending down the expected editor syntax but emitting the correct
 * syntax for a datatype on change.
 */
export const Converter = React.memo(function Converter(props) {
  // NOTE: emit formated changes to listeners
  const onChange = (val) => {
    if (val === "<p></p>") {
      val = "";
    }

    if (props.datatype === "markdown") {
      // NOTE: If a markdown field but being viewed in a non-markdown editor
      // convert back to markdown before emitting change. This ensures markdown syntax
      // is saved to the API
      if (props.editor !== "markdown") {
        val = convert.makeMarkdown(val);
      }
    } else {
      val = convert.makeHtml(val);
    }

    props.onChange(val, props.name, props.datatype);
  };

  // NOTE: Based on selected editor convert content on the way into the component
  // if markdown datatype but in a different editor mode convert to html
  // works in tandem with formating during onChange function
  let content = props.value;
  if (props.datatype === "markdown" && props.editor !== "markdown") {
    content = convert.makeHtml(props.value);
  }
  if (props.datatype !== "markdown" && props.editor === "markdown") {
    content = convert.makeMarkdown(props.value);
  }

  return (
    <Fragment>
      {props.editor === "wysiwyg_basic" && (
        <BasicEditor
          value={content}
          version={props.version}
          mediaBrowser={props.mediaBrowser}
          onChange={onChange}
          error={props.error}
        />
      )}
      {props.editor === "article_writer" && (
        <InlineEditor
          value={content}
          version={props.version}
          mediaBrowser={props.mediaBrowser}
          onChange={onChange}
          error={props.error}
        />
      )}
      {props.editor === "markdown" && (
        <MarkdownEditor
          value={content}
          version={props.version}
          onChange={onChange}
          error={props.error}
        />
      )}
      {props.editor === "html" && (
        <HtmlEditor
          value={content}
          version={props.version}
          onChange={onChange}
          error={props.error}
        />
      )}
    </Fragment>
  );
});
