"use strict";

import { useMemo } from "react";
import { useSelector } from "react-redux";

export function usePreviewLink(itemZUID = "", versionOverride = null) {
  const item = useSelector((state) => state.content[itemZUID]);
  const settings = useSelector((state) => state.settings);
  const previewLock = useSelector((state) =>
    state.settings.instance.find(
      (setting) => setting.key === "preview_lock_password" && setting.value
    )
  );

  return useMemo(() => {
    // does the item have a web path or is it headless?
    let url = item?.web?.path
      ? item.web.path
      : `/-/instant/${item.meta.ZUID}.json`;

    url = `${url}?_bypassError=true`;
    url = `${url}&__version=${
      versionOverride ? versionOverride : item.meta.version
    }`;

    // does the instance have a preview lock set?
    if (previewLock) {
      url = `${url}&zpw=${previewLock.value}`;
    }

    return url;
  }, [settings, itemZUID, versionOverride]);
}
