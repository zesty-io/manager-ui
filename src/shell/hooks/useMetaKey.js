import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * useMetaKey is a hook that allows for attaching a callback to keyboard events
 * @param {String} key character
 * @param {String} modifier Options: "shift", "shiftKey", "alt", "altKey"
 * @param {Function} callback bound to keypress
 * @returns {String} OS specific meta/ctrl and key shortcut
 * @example
 * const metaShortcut = useMetaKey('s', "shift" handleSave)
 */

export function useMetaKey(key, modifier, callback) {
  if (!key) {
    throw new Error("First parameter must be a key character");
  }
  if (typeof modifier !== "function" && typeof callback !== "function") {
    throw new Error("Callback function is required");
  }

  const platform = useSelector((state) => state.platform);
  /**
   * We are ignoring the rebinding on consumer renders,
   * while this may be inefficient it's an easier to understand cost
   * than trying to manage state whether the event handler should be rebound
   *
   * We considered this implementation here https://stackoverflow.com/a/57556594
   * we may want to revisit this in the future
   *
   * IMPORTANT: Must use effect dependencies. Otherwise causes bugs as the values in the function reference do not get updated.
   *
   */
  useEffect(() => {
    const onKeyDown = (evt) => {
      if (
        (platform.isMac && evt.metaKey === true) ||
        (!platform.isMac && evt.ctrlKey === true)
      ) {
        if (evt.key.toLowerCase() === key.toLowerCase()) {
          // the hook is a variadic function therefore the second parameter
          // can be either a function or string(modifier key)
          if (typeof modifier === "function") {
            evt.preventDefault();
            modifier();
          } else {
            if (["shift", "shiftKey"].includes(modifier) && evt.shiftKey) {
              evt.preventDefault();
              callback();
            }
            if (["alt", "altKey"].includes(modifier) && evt.altKey) {
              evt.preventDefault();
              callback();
            }
          }
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [key, modifier, callback]);

  const metaKey = platform.isMac ? `cmd` : `ctrl`;
  const modifierKey = typeof modifier === "string" ? "+" + modifier : "";

  return `(${metaKey} ${modifierKey} + ${key})`;
}
