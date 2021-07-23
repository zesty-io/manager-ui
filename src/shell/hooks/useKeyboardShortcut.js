import { useEffect, useCallback, useReducer } from "react";

/*/
https://keycode.info/
//https://github.com/arthurtyukayev/use-keyboard-shortcut

 EX:   useKeyboardShortcut(["meta", "d"], () => console.log("Action"), {
    overrideSystem: true,
  });
  */

const blacklistedTargets = ["INPUT", "TEXTAREA"];

const keysReducer = (state, action) => {
  switch (action.type) {
    case "set-key-down":
      const keydownState = { ...state, [action.key]: true };
      return keydownState;
    case "set-key-up":
      const keyUpState = { ...state, [action.key]: false };
      return keyUpState;
    case "reset-keys":
      const resetState = { ...action.data };
      return resetState;
    default:
      return state;
  }
};

//shortcutKeys = array of keyboard events
const useKeyboardShortcut = (shortcutKeys, callback, options) => {
  if (!Array.isArray(shortcutKeys))
    throw new Error(
      "The first parameter to `useKeyboardShortcut` must be an ordered array of `KeyboardEvent.key` strings."
    );

  if (!shortcutKeys.length)
    throw new Error(
      "The first parameter to `useKeyboardShortcut` must contain atleast one `KeyboardEvent.key` string."
    );

  if (!callback || typeof callback !== "function")
    throw new Error(
      "The second parameter to `useKeyboardShortcut` must be a function that will be envoked when the keys are pressed."
    );

  const { overrideSystem } = options || {};

  //Converting array keys pressed to an object of lowercase keys
  const initalKeyMapping = shortcutKeys.reduce((currentKeys, key) => {
    currentKeys[key.toLowerCase()] = false;
    return currentKeys;
  }, {});

  const [keys, setKeys] = useReducer(keysReducer, initalKeyMapping);

  //Prevent function from being re-created, we wrap in useCallback
  const keydownListener = useCallback(
    (assignedKey) => (keydownEvent) => {
      const loweredKey = assignedKey.toLowerCase();

      //Check to make sure that this KeyboardEvent is not a repeating event,
      if (keydownEvent.repeat) return;

      //Check to make sure that DOM element isn't an input or textarea because we don't want to trigger keyboard shortcuts when the user is typing.
      if (blacklistedTargets.includes(keydownEvent.target.tagName)) return;

      //Check to make sure that the pressed key is in the shortcutKeys array,
      if (loweredKey !== keydownEvent.key.toLowerCase()) return;

      //Update the state to indicate the key is being held down.‍
      if (keys[loweredKey] === undefined) return;

      if (overrideSystem) {
        keydownEvent.preventDefault();
        disabledEventPropagation(keydownEvent);
      }

      setKeys({ type: "set-key-down", key: loweredKey });
      return false;
    },
    [keys, overrideSystem]
  );

  const keyupListener = useCallback(
    (assignedKey) => (keyupEvent) => {
      const raisedKey = assignedKey.toLowerCase();

      if (blacklistedTargets.includes(keyupEvent.target.tagName)) return;
      if (keyupEvent.key.toLowerCase() !== raisedKey) return;
      if (keys[raisedKey] === undefined) return;

      if (overrideSystem) {
        keyupEvent.preventDefault();
        disabledEventPropagation(keyupEvent);
      }

      setKeys({ type: "set-key-up", key: raisedKey });
      return false;
    },
    [keys, overrideSystem]
  );

  // Check out keys state object to make sure that all of the keys are currently being held down. Once that criteria is met it will fire the callback function.
  useEffect(() => {
    if (!Object.values(keys).filter((value) => !value).length) {
      callback(keys);
      setKeys({ type: "reset-keys", data: initalKeyMapping });
    } else {
      setKeys({ type: null });
    }
  }, [callback, keys]);

  useEffect(() => {
    shortcutKeys.forEach((k) =>
      window.addEventListener("keydown", keydownListener(k))
    );
    return () =>
      shortcutKeys.forEach((k) =>
        window.removeEventListener("keydown", keydownListener(k))
      );
  }, []);

  useEffect(() => {
    shortcutKeys.forEach((k) =>
      window.addEventListener("keyup", keyupListener(k))
    );
    return () =>
      shortcutKeys.forEach((k) =>
        window.removeEventListener("keyup", keyupListener(k))
      );
  }, []);
};

export default useKeyboardShortcut;

//Override browser helper
export function disabledEventPropagation(e) {
  if (e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    } else if (window.event) {
      window.event.cancelBubble = true;
    }
  }
}
