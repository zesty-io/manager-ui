import { useState } from "react";
import { StickyTree } from "react-virtualized-sticky-tree";
import Measure from "react-measure";

export function MediaNav(props) {
  const [navHeight, setNavHeight] = useState();
  const [navWidth, setNavWidth] = useState();

  return (
    <Measure
      bounds={true}
      onResize={(contentRect) => {
        setNavWidth(contentRect.bounds.width);
        setNavHeight(contentRect.bounds.height);
      }}
    >
      {({ measureRef }) => (
        <ul
          ref={measureRef}
          className={props.className ? props.className : null}
        >
          <StickyTree
            root={{ id: props.rootID, height: 30 }}
            getChildren={props.getChildren}
            rowRenderer={props.rowRenderer}
            renderRoot={false}
            width={navWidth}
            height={navHeight}
          />
        </ul>
      )}
    </Measure>
  );
}
