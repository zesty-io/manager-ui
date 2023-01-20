import { createStore } from "idb-keyval";
import {
  get,
  set,
  getMany,
  setMany,
  del,
  clear,
  entries,
  keys,
  values,
} from "idb-keyval";

const DB = "zesty";
const STORE = "manager-ui";

// use a custom store so we can recreate the reference
// if it gets deleted during runtime
let customStore = createStore(DB, STORE);

export default {
  get(key: IDBValidKey) {
    return get(key, customStore);
  },
  getMany(arr: IDBValidKey[]) {
    return getMany(arr, customStore);
  },
  async set(key: IDBValidKey, val: any) {
    return set(key, val, customStore).catch((err) => {
      if (err.name === "InvalidStateError") {
        // recreate store
        customStore = createStore(DB, STORE);
      } else {
        console.error(err);
      }
    });
  },
  setMany(arr: [IDBValidKey, any][]) {
    return setMany(arr, customStore);
  },
  del(key: IDBValidKey) {
    return del(key, customStore);
  },
  clear() {
    return clear(customStore);
  },
  entries() {
    return entries(customStore);
  },
  keys() {
    return keys(customStore);
  },
  values() {
    return values(customStore);
  },
};
