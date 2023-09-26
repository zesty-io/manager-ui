import React, { useEffect, useRef, useState, useMemo } from "react";

// import { HtmlEditor } from "@aeaton/react-prosemirror";
import { HtmlEditor } from "./react-prosemirror/HtmlEditor";
// import { MenuBar } from "@aeaton/react-prosemirror";
import { MenuBar } from "./react-prosemirror/MenuBar";

import { LinkModal } from "./LinkModal";
import { EmbedModal } from "./EmbedModal";

import { schema } from "./react-prosemirror-schema";
import { plugins } from "./react-prosemirror-plugins";
import { menu } from "./react-prosemirror-menu";

import { ImageResizeView } from "./prosemirror-views/ImageResizeView";
import { IframeResizeView } from "./prosemirror-views/IframeResizeView";
import { VideoResizeView } from "./prosemirror-views/VideoResizeView";

import styles from "./Basic.less";
export function BasicEditor(props) {
  const ref = useRef();

  const [modals, setModals] = useState({
    showLinkModal: false,
    showEmbedModal: false,
    showEmbedModalOptions: {},
  });

  // only recreate options, which cause prosemirror update,
  // when the version changes. Otherwise prosemirror manages
  // it's own internal document model
  const options = useMemo(() => {
    return { plugins, schema };
  }, [props.version]);

  const onModalOpen = function onModalOpen(name, options) {
    // NOTE: We match a queryselctor with the prosemirror dom to handle multiple editors in a single view.
    if (
      ref.current &&
      ref.current.querySelector &&
      ref.current.querySelector(".ProseMirror") == options.view.dom
    ) {
      setModals({
        ...modals,
        [name]: true,
        [`${name}Options`]: options,
      });
    }
  };

  const onModalClose = (name) => {
    setModals({
      ...modals,
      [name]: false,
    });
  };

  useEffect(() => {
    zesty.on("PROSEMIRROR_DIALOG_OPEN", onModalOpen);
    zesty.on("PROSEMIRROR_DIALOG_CLOSE", onModalClose);

    return () => {
      zesty.off("PROSEMIRROR_DIALOG_OPEN", onModalOpen);
      zesty.off("PROSEMIRROR_DIALOG_CLOSE", onModalClose);
    };
  }, [ref]);

  return (
    <div className={styles.BasicEditor}>
      <HtmlEditor
        options={options}
        value={props.value}
        version={props.version}
        modals={modals} // provided to editor so it can make render choice
        onChange={props.onChange}
        render={({ editor, view }) => (
          <div>
            <LinkModal view={view} open={modals.showLinkModal} />
            <EmbedModal
              open={modals.showEmbedModal}
              options={modals.showEmbedModalOptions}
              view={view}
            />
            <MenuBar
              menu={menu({ mediaBrowser: props.mediaBrowser })}
              view={view}
            />
            <div ref={ref}>{editor}</div>
          </div>
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
    </div>
  );
}
