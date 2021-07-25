import { useEffect } from "react";
import { useSelector } from "react-redux";

/*
Usage Example
  useKeyboardShortcut("letter", () => callback());

*/

export function useKeyboardShortcut(key, callback) {
  //Get OS
  const platform = useSelector((state) => state.platform);

  if (!key)
    throw new Error(
      "The first parameter to `useKeyboardShortcut` must be a valid `KeyboardEvent.key` strings."
    );
  if (!callback || typeof callback !== "function")
    throw new Error(
      "The second parameter to `useKeyboardShortcut` must be a function that will be invoked when the keys are pressed."
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
}
