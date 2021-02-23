import parse from "csv-parse/lib/es5/sync";
import { notify } from "shell/store/notifications";
export const IMPORT_LOADING = "IMPORT_LOADING";
export const IMPORT_REDIRECTS = "IMPORT_REDIRECTS";
export const IMPORT_CODE = "IMPORT_CODE";
export const IMPORT_TARGET = "IMPORT_TARGET";
export const IMPORT_QUERY = "IMPORT_QUERY";

export function imports(state = {}, action) {
  switch (action.type) {
    case IMPORT_REDIRECTS:
      return action.redirects;

    case "REDIRECT_CREATE_SUCCESS":
      return Object.keys(state).reduce((acc, key) => {
        if (key === action.redirect.path) {
          // We take the states computed target over the zuid used
          // for the api redirect creation
          acc[key] = Object.assign({}, action.redirect, state[key], {
            canImport: false
          });
        } else {
          acc[key] = { ...state[key] };
        }
        return acc;
      }, {});

    case IMPORT_CODE:
      return Object.keys(state).reduce((acc, key) => {
        acc[key] = { ...state[key] };
        if (key === action.path) {
          acc[key].code = action.code;
        }
        return acc;
      }, {});

    case IMPORT_TARGET:
      return Object.keys(state).reduce((acc, key) => {
        acc[key] = { ...state[key] };
        if (key === action.path) {
          acc[key].target = action.target;
          acc[key].target_zuid = action.targetZuid;
        }
        return acc;
      }, {});

    case IMPORT_QUERY:
      return Object.keys(state).reduce((acc, key) => {
        acc[key] = { ...state[key] };
        if (key === action.path) {
          acc[key].query_string = action.query;
        }
        return acc;
      }, {});

    default:
      return state;
  }
}

export function cancelImports(evt) {
  return {
    type: IMPORT_REDIRECTS,
    redirects: []
  };
}

export function importCode(path, code) {
  return {
    type: IMPORT_CODE,
    path,
    code
  };
}
export function importTarget(path, target, targetZuid) {
  return {
    type: IMPORT_TARGET,
    path,
    target,
    targetZuid
  };
}
export function importQuery(path, query) {
  return {
    type: IMPORT_QUERY,
    path,
    query
  };
}

export function CSVImporter(evt) {
  return (dispatch, getState) => {
    dispatch({ type: IMPORT_LOADING });

    if (evt.currentTarget.files.length) {
      const state = getState();
      const CSV_REGEXP = /.*\.csv$/;
      for (var i = evt.currentTarget.files.length - 1; i >= 0; i--) {
        const file = evt.currentTarget.files[i];

        if (
          file.type === "text/csv" ||
          file.type === "text/xml" ||
          file.name.match(CSV_REGEXP) // workaround for Windows CSV which have no MIME type
        ) {
          const fileReader = new FileReader();

          fileReader.onerror = err => {
            console.log("TODO// handle error event", err);
          };
          fileReader.onloadstart = evt => {
            console.log("TODO// handle start event", evt);
          };
          fileReader.onprogress = evt => {
            console.log("TODO// handle progress event", evt);
          };
          fileReader.onloadend = () => {
            let targets = {};

            if (file.type === "text/csv" || file.name.match(CSV_REGEXP)) {
              const [columns, imports] = CSVToArray(fileReader.result);
              targets = compareKeys(imports, state.redirects);
            } else if (file.type === "text/xml") {
              const parser = new DOMParser();
              const xml = parser.parseFromString(fileReader.result, "text/xml");
              targets = parseXML(xml, dispatch);
            }

            targets = findTargetPages(targets);

            // Avoid flash of loader
            setTimeout(() => {
              dispatch({
                type: IMPORT_REDIRECTS,
                redirects: targets
              });
            }, 250);
          };

          fileReader.readAsText(file, "UTF-8");
        } else {
          dispatch({
            type: IMPORT_REDIRECTS,
            redirects: []
          });
          dispatch(notify({ message: "Imports must be a CSV file" }));
          throw new Error("Importer requires a CSV");
        }
      }
    }
  };
}

/**
 * CSV must be 3 columns in the order of;
 * `from`, `target`, `code`. With the first
 * row a list column headers
 */
function CSVToArray(csv) {
  const rows = parse(csv, {
    skip_empty_lines: true
  });
  const columns = rows[0];
  const redirects = rows
    .slice(1)
    .map(row => {
      const [original, target, code] = row;
      const [path, query] = original.split("?");
      return {
        path: path,
        query_string: query || null,
        target_type: "path",
        target_zuid: null,
        target: target,
        code: code || "301",
        canImport: true
      };
    })
    .filter(redirect => {
      if (redirect.path && redirect.target && redirect.code) {
        return true;
      }
    })
    .reduce((acc, redirect) => {
      acc[redirect.path] = redirect;
      return acc;
    }, {});

  return [columns, redirects];
}

/**
 * Determine if the import path already exists
 * as a redirect path.
 * @param  {object} imports
 * @param  {object} redirects
 * @return {object}           Redirect imports marked if they can be imported
 */
function compareKeys(imports, redirects) {
  return Object.keys(imports).reduce((acc, path) => {
    acc[path] = { ...imports[path] };

    // Check if the path exists with or without trailing slash
    if (redirects[path] || redirects[path.replace(/\/+$/, "")]) {
      acc[path].canImport = false;
    }
    return acc;
  }, {});
}

/**
 * Determine if import target matches a page
 * and update import accordingly
 * @param  {object} imports Redirect imports
 * @param  {object} paths   System page paths
 * @return {object}         Redirect imports keyed by path
 */
function findTargetPages(imports) {
  return Object.keys(imports).reduce((acc, path) => {
    acc[path] = { ...imports[path] };
    return acc;
  }, {});
}

function parseXML(xml, dispatch) {
  const urlset = xml.children[0];

  if (urlset.nodeName !== "urlset") {
    dispatch(
      notify({
        kind: "warn",
        message:
          "XML sitemap imports must follow the https://www.sitemaps.org/protocol.html spec."
      })
    );
    throw new Error("Invalid XML root node.");
  }

  let redirects = {};

  for (var i = urlset.children.length - 1; i >= 0; i--) {
    const loc = urlset.children[i].children.item(0);
    const url = loc.textContent.trim();
    const [path, query] = url.split("?");
    // const parts = path.split('/')

    redirects[path] = {
      path: path,
      query_string: query || null,
      target_type: "path",
      target_zuid: null,
      target: "/", // Default to homepage
      code: "301",
      canImport: true
    };
  }

  return redirects;
}
