import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

/*
Usage Example
  useMetaKey("letter", callback);
*/

export function useMetaKey(key, callback) {
  const platform = useSelector((state) => state.platform);
  const [shortCut, setShortCut] = useState(false);

  if (!key)
    throw new Error(
      "Invalid character input, must be a individual letter key."
    );
  if (!callback || typeof callback !== "function")
    throw new Error(
      "Invalid input, the second parameter to must be a function."
    );

  const onKeyDown = useCallback(
    (evt) => {
      if (
        (platform.isMac && evt.metaKey === true && evt.key === key) ||
        (!platform.isMac && evt.ctrlKey === true && evt.key === key)
      ) {
        evt.preventDefault();
        setShortCut(true);
        callback();
      } else {
        setShortCut(false);
      }
    },
    [setShortCut, callback]
  );

  useEffect(() => {
    if (!shortCut) {
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
      setShortCut(false);
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortCut, onKeyDown]);

  return `(${platform.isMac ? `cmd` : `ctrl`} + ${key})`;
}
