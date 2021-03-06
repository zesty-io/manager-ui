import zuid from "zuid";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

export function useFilePath(ZUID = "") {
  const files = useSelector((state) => state.files);
  const content = useSelector((state) => state.content);

  if (!ZUID) {
    throw new Error("Required ZUID argument was not provided");
  }

  //Currently accepting model zuids, view, stylesheet, javascript zuids
  // There is no place where this method is called by a content item zuid, if there was we would need to reference all items.
  switch (Number(ZUID.split("-")[0])) {
    // Searching on Model ZUID
    case zuid.prefix.SITE_CONTENT_SET:
      let findfile = files.find((file) => file.contentModelZUID === ZUID);
      if (findfile) {
        return `/code/file/views/${findfile.ZUID}`;
      } else {
        return "/code";
      }

    // Searching on Content Item ZUID
    case zuid.prefix.SITE_CONTENT_ITEM:
      const item = content[ZUID];

      if (item.meta.contentModelZUID) {
        const findFile = files.find(
          (file) => file.contentModelZUID === item.meta.contentModelZUID
        );
        if (findFile) {
          return `/code/file/views/${findFile.ZUID}`;
        }
      }
      return "/code";

    case zuid.prefix.SITE_RESOURCE:
      const callBack = (file) => file.ZUID === ZUID;
      let file = files.find(callBack);
      if (file) {
        if (file.type === "text/javascript") {
          return `/code/file/scripts/${ZUID}`;
        } else {
          return `/code/file/stylesheets/${ZUID}`;
        }
      } else {
        return "/code";
      }

    case zuid.prefix.SITE_VIEW:
      return `/code/file/views/${ZUID}`;

    default:
      return "/code";
  }
}
