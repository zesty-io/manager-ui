import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 *
 * @param {*} key key to listen to keypress
 * @param {*} callback action bound to keypress
 * @returns String OS specific meta/ctrl and key shortcut
 * @example
 * const metaShortcut = useMetaKey('s', handleSave)
 */

export function useMetaKey(key, callback) {
  const platform = useSelector((state) => state.platform);

  if (!key) {
    throw new Error(
      "Invalid character input, must be a individual letter key."
    );
  }
  if (!callback || typeof callback !== "function") {
    throw new Error(
      "Invalid input, the second parameter to must be a function."
    );
  }

  /**
   * We are ignoring the rebinding on consumer renders,
   * while this may be inefficient it's an easier to understand cost
   * than trying to manage state whether the event handler should be rebound
   *
   * We considered this implementation here https://stackoverflow.com/a/57556594
   * we may want to revisit this in the future
   *
   * IMPORTANT: Not using dependencies within the effect causes bugs as the values in the function reference do not get updated
   *
   */
  useEffect(() => {
    const onKeyDown = (evt) => {
      if (
        (platform.isMac && evt.metaKey === true && evt.key === key) ||
        (!platform.isMac && evt.ctrlKey === true && evt.key === key)
      ) {
        evt.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [key, callback]);

  return `(${platform.isMac ? `cmd` : `ctrl`} + ${key})`;
}
