import { useEffect } from "react";
import { useSelector } from "react-redux";

/*
Usage Example
  useMetaKey("letter", callback);
*/

export function useMetaKey(key, callback) {
  const platform = useSelector((state) => state.platform);

  if (!key)
    throw new Error(
      "The first parameter to `useMetaKey` must be a valid `KeyboardEvent.key` strings."
    );
  if (!callback || typeof callback !== "function")
    throw new Error(
      "The second parameter to `useMetaKey` must be a function that will be invoked when the keys are pressed."
    );

  useEffect(() => {
    function onKeyDown(evt) {
      if (
        (platform.isMac && evt.metaKey === true && evt.key === key) ||
        (!platform.isMac && evt.ctrlKey === true && evt.key === key)
      ) {
        evt.preventDefault();
        callback();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [callback]);

  return `(${platform.isMac ? `cmd` : `ctrl`} + ${key})`;
}
