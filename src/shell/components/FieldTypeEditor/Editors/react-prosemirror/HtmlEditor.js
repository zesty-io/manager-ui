import React, { useCallback, useMemo } from "react";
import debounce from "lodash/debounce";
import { DOMParser, DOMSerializer } from "prosemirror-model";

import Editor from "./Editor";

const parser = (schema) => {
  const parser = DOMParser.fromSchema(schema);

  return (content) => {
    const container = document.createElement("article");
    container.innerHTML = content;

    return parser.parse(container);
  };
};

const serializer = (schema) => {
  const serializer = DOMSerializer.fromSchema(schema);

  return (doc) => {
    const container = document.createElement("article");
    container.appendChild(serializer.serializeFragment(doc.content));

    return container.innerHTML;
  };
};

export function HtmlEditor(props) {
  // recreate parse/seralize if options props changes
  const parse = useCallback(parser(props.options.schema), [props.options]);
  const serialize = useCallback(serializer(props.options.schema), [
    props.options,
  ]);
  const onChange = useCallback(
    (doc) => props.onChange(serialize(doc)),
    [serialize]
  );

  // recreate memoized options if parse changes
  const opts = useMemo(() => {
    const newOpts = { ...props.options };
    newOpts.doc = parse(props.value);
    return newOpts;
  }, [parse]);

  return (
    <Editor
      onChange={onChange}
      options={opts}
      autoFocus={props.autoFocus}
      attributes={props.attributes}
      render={props.render}
      version={props.version}
      modals={props.modals}
      nodeViews={props.nodeViews}
    />
  );
}
