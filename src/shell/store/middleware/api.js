import { request } from "utility/request";

import { fetchItems } from "shell/store/content";
import { fetchFields } from "shell/store/fields";

// Map of URI to inflight request promise
const inflight = {};
export const fetchResource =
  (store) =>
  (next) =>
  (action = {}) => {
    if (action.type === "FETCH_RESOURCE") {
      // Track inflight API requests, keep a reference to the promise so we can
      // return a reference to the same promise to any number of duplicate
      // requests
      if (!(action.uri in inflight)) {
        const promise = request(action.uri)
          .then(action.handler)
          .then((res) => {
            // on resolve, remove promise from inflight map
            // the consumers will still have a reference to the resolved promise
            delete inflight[action.uri];
            // continue response through promise chain
            return res;
          })
          .catch((err) => {
            // on reject, remove promise from inflight map
            // the consumers will still have a reference to the rejected promise
            delete inflight[action.uri];
            if (action.error) {
              action.error(err);
            } else {
              // console.log("middleware:fetchResource", err);
              // TODO dispatch a global notification
              throw err;
            }
          });
        // keep a reference to the promise so it can be returned to any
        // potential duplicate requests
        inflight[action.uri] = promise;
        return promise;
      } else {
        console.log("duplicate request: ", action.uri);
        // return the a reference to the promise representing the first
        // request to any duplicate requests
        return inflight[action.uri];
      }
    } else {
      return next(action);
    }
  };

export const resolveFieldOptions =
  (store) =>
  (next) =>
  (action = {}) => {
    if (action.type === "FETCH_FIELDS_SUCCESS") {
      if (action.payload) {
        Object.keys(action.payload).forEach((ZUID) => {
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
                (fieldZUID) => fieldZUID === field.relatedFieldZUID
              );
              if (!fieldsExist) {
                store.dispatch(fetchFields(field.relatedModelZUID));
              }

              const zuid = Object.keys(state.content).find(
                (itemZUID) =>
                  state.content[itemZUID].meta.contentModelZUID ===
                  field.relatedModelZUID
              );

              if (!zuid || state.content[zuid].meta.ZUID) {
                store.dispatch(
                  fetchItems(field.relatedModelZUID, {
                    lang: state.user.selected_lang,
                  })
                );
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
