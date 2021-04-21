import { set as idbSet } from "idb-keyval";
import { createStore } from "idb-keyval";

const DB = "zesty";
const STORE = "manager-ui";

// use a custom store so we can recreate the reference
// if it gets deleted during runtime
let customStore = createStore(DB, STORE);

// no need to wrap so just  re-export
export { get, getMany } from "idb-keyval";

export function set(key, val) {
  idbSet(key, val, customStore).catch(err => {
    if (err.name === "InvalidStateError") {
      // Recreate store with default name
      customStore = createStore(DB, STORE);
    } else {
      console.error(err);
    }
  });
}
