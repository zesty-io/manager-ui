import React, { useMemo } from "react";

// import { HtmlEditor } from "@aeaton/react-prosemirror";
import { HtmlEditor } from "./react-prosemirror/HtmlEditor";
import { Floater } from "@aeaton/react-prosemirror";
import { MenuBar } from "./react-prosemirror/MenuBar";

import { schema } from "./react-prosemirror-schema";
import { plugins } from "./react-prosemirror-plugins";
import { inline } from "./react-prosemirror-menu";

import { ImageResizeView } from "./prosemirror-views/ImageResizeView";
import { IframeResizeView } from "./prosemirror-views/IframeResizeView";
import { VideoResizeView } from "./prosemirror-views/VideoResizeView";

import styles from "./Inline.less";
export function InlineEditor(props) {
  // NOTE: only recreate options, which cause prosemirror update,
  // when the version changes. Otherwise prosemirror manages
  // it's own internal document model
  const options = useMemo(() => {
    return { plugins, schema };
  }, [props.version]);

  return (
    <HtmlEditor
      options={options}
      value={props.value}
      version={props.version}
      onChange={props.onChange}
      render={({ editor, view }) => (
        <section className={styles.InlineEditor}>
          <Floater view={view}>
            <MenuBar
              menu={inline({ mediaBrowser: props.mediaBrowser })}
              view={view}
            />
          </Floater>
          {editor}
        </section>
      )}
      nodeViews={{
        image(node, view, getPos) {
          return new ImageResizeView(node, view, getPos);
        },
        iframe(node, view, getPos) {
          return new IframeResizeView(node, view, getPos);
        },
        video(node, view, getPos) {
          return new VideoResizeView(node, view, getPos);
        },
      }}
    />
  );
}
