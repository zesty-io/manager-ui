import zuid from "zuid";
import { useSelector } from "react-redux";

export function useFilePath(ZUID = "") {
  const getFiles = state => state.files;
  const selectFiles = createSelector([getFiles], files => files);
  const files = useSelector(selectFiles);
  if (!ZUID) {
    throw new Error("Required ZUID argument was not provided");
  }

  switch (Number(ZUID.split("-")[0])) {
    case zuid.prefix.SITE_CONTENT_SET:
      let file = files.find(file => file.contentModelZUID === ZUID);
      if (file) {
        return `/code/file/views/${file.ZUID}`;
      } else {
        return "/code";
      }

    //place holder content item logic
    // case zuid.prefix.SITE_CONTENT_ITEM:
    //   return;

    case zuid.prefix.SITE_RESOURCE:
      const callBack = file => file.ZUID === ZUID;
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
