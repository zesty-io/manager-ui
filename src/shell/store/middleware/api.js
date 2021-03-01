import { request } from "utility/request";

import { fetchItems } from "shell/store/content";
import { fetchFields } from "shell/store/fields";

const inflight = [];
export const fetchResource = store => next => (action = {}) => {
  if (action.type === "FETCH_RESOURCE") {
    // Track inflight API requests
    if (inflight.indexOf(action.uri) === -1) {
      inflight.push(action.uri);
      return request(action.uri)
        .then(action.handler)
        .then(res => {
          inflight.splice(inflight.indexOf(action.uri), 1);

          // continue response through promise chain
          return res;
        })
        .catch(err => {
          inflight.splice(inflight.indexOf(action.uri), 1);
          if (action.error) {
            action.error(err);
          } else {
            // console.log("middleware:fetchResource", err);
            // TODO dispatch a global notification
            throw err;
          }
        });
    } else {
      console.log("duplicate request: ", action.uri);
      return Promise.resolve();
    }
  } else {
    return next(action);
  }
};

export const resolveFieldOptions = store => next => (action = {}) => {
  if (action.type === "FETCH_FIELDS_SUCCESS") {
    if (action.payload) {
      Object.keys(action.payload).forEach(ZUID => {
        const field = action.payload[ZUID];

        if (
          field.relatedModelZUID &&
          field.relatedFieldZUID &&
          !field.deletedAt
        ) {
          const state = store.getState();

          // Only fetch related resources if we have these reducers available
          if (state.fields && state.content) {
            // Check current state to determine if we should
            // fetch fields and items for a model. Otherwise fetching
            // fields creates an infinite loop due this resolution
            const fieldsExist = Object.keys(state.fields).find(
              fieldZUID => fieldZUID === field.relatedFieldZUID
            );
            if (!fieldsExist) {
              store.dispatch(fetchFields(field.relatedModelZUID));
            }

            const itemsExist = Object.keys(state.content).find(
              itemZUID =>
                state.content[itemZUID].meta.contentModelZUID ===
                field.relatedModelZUID
            );

            if (!itemsExist) {
              store.dispatch(fetchItems(field.relatedModelZUID));
            }

            // TODO dispatch web worker background fetch relationship
            // if (window.Worker) {
            //   const w = new Worker("relationship-worker.js");
            //   w.onmessage = msg => {
            //     console.log("Worker response: ", msg);
            //     console.log(typeof msg);
            //     // store.dispatch(fetchItems(relatedModel));
            //   };
            //   w.postMessage(
            //     `${CONFIG.API_INSTANCE}/content/models/${relatedModel}/items`
            //   );
            // }
          }
        }
      });
    }
  }

  return next(action);
};

/*
  Options are always stored 1 first 0 second. The labels attached
  to these values aren't always aligned to their boolean semantics
  Meaning we can't try to determine which is true false. We have to split
  the string and render against the structured order.

  e.g.
  str = "1:No;0:Yes"

  ["1:No", "0:Yes"] = str.split(";")
  ["1", "No"] = [0].split(":")
  ["0", "Yes"] = [1].split(":")
*/
// function parseFieldDelimiter(prop) {
//   // Only parse if prop is a string
//   if (String(prop) === prop) {
//     return prop.split(";").reduce((acc, el) => {
//       let s = el.split(":");
//       acc[s[0]] = s[1];
//       return acc;
//     }, {});
//   }

//   // Otherwise it's probably an already parse field from localStorage
//   return prop;
// }
