import { set } from "utility/idb";

import {
  faStickyNote,
  faDatabase,
  faListAlt,
  faFileCode,
  faBolt,
  faDirections,
  faLock
} from "@fortawesome/free-solid-svg-icons";
import {
  faJs,
  faCss3Alt,
  faLess,
  faSass
} from "@fortawesome/free-brands-svg-icons";

import { resolvePathPart } from "./files";

export function navCode(
  state = {
    raw: [],
    tree: []
  },
  action
) {
  let files;

  switch (action.type) {
    // Derive nav when loading files
    case "LOADED_LOCAL_OPEN_FILES":
    case "FETCH_FILES_SUCCESS":
    case "FETCH_FILE_SUCCESS":
      /**
       * Because the nav is not concerned with the files code we spread
       * the local state last to ensure it is preserved (e.g. sort,) when de-duped with
       * the reduce.
       */
      let map = [...action.payload.files, ...state.raw]
        .filter(file => file.status === "dev")
        .reduce((acc, file) => {
          acc[file.ZUID] = file;
          return acc;
        }, {});

      // convert back to array
      files = Object.values(map).map(resolveNavData);

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    // blend header sort data into our nav
    case "FETCH_HEADERS_SUCCESS":
      const headersMap = action.payload
        .filter(header => header.resourceZUID) // must have a resourceZUID
        .reduce((acc, header) => {
          acc[header.resourceZUID] = header;
          return acc;
        }, {}); // convert to map for easy lookups

      // Add sort value to resource label
      files = state.raw.map(file => {
        if (headersMap[file.ZUID]) {
          file.sort = headersMap[file.ZUID].sort;
        }
        return resolveNavData(file);
      });

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    case "COLLAPSE_DIRECTORY":
      let files = state.raw.map(node => {
        if (node.fileName.includes(action.payload.path)) {
          node.closed = !node.closed;
        }
        return node;
      });

      // Store files which are collapsed locally
      set(
        `${action.payload.instanceZUID}:openFiles`,
        files.filter(file => file.open || file.closed)
      );

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    case "SAVE_FILE_SUCCESS":
      files = state.raw.map(file => {
        if (file.ZUID === action.payload.file.ZUID) {
          return {
            ...file,
            version: 1 + action.payload.file.version,
            synced: true,
            dirty: false,
            isLive: false
          };
        }
        return file;
      });

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    case "PUBLISH_FILE_SUCCESS":
      files = state.raw.map(file => {
        if (file.ZUID === action.payload.fileZUID) {
          return {
            ...file,
            isLive: true
          };
        }
        return file;
      });

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    case "DELETE_FILE_SUCCESS":
      files = state.raw.filter(file => {
        if (file.ZUID !== action.payload.fileZUID) {
          return file;
        }
      });

      return {
        raw: files,
        tree: buildNavTree(files)
      };

    default:
      return state;
  }
}

export function collapseNavItem(path) {
  return (dispatch, getState) => {
    dispatch({
      type: "COLLAPSE_DIRECTORY",
      payload: {
        path,
        instanceZUID: getState().instance.ZUID
      }
    });
  };
}

function resolveNavData(file) {
  const ICONS = {
    // Parsley views
    snippet: faStickyNote,
    dataset: faDatabase,
    pageset: faListAlt,
    templateset: faFileCode,

    // Instant api
    "ajax-json": faBolt,
    "ajax-html": faBolt,

    // JavaScript
    "text/js": faJs,
    "text/javascript": faJs,

    // Stylesheets
    "text/css": faCss3Alt,
    "text/less": faLess,
    "text/scss": faSass,
    "text/sass": faSass,

    "404": faDirections
  };

  const pathPart = resolvePathPart(file.type);

  let node = {
    ...file,
    label: file.sort ? `(${file.sort}) ${file.fileName}` : file.fileName,
    path: `/code/file/${pathPart}/${file.ZUID}`,
    icon: file.fileName === "loader" ? faLock : ICONS[file.type]
  };

  // Remove this prop to ensure we don't accidentially
  // trigger a re-render whenever code changes
  delete node.code;

  return node;
}

export const buildNavTree = nodes => {
  const tree = [];

  let map = nodes.reduce((acc, node) => {
    // Remove the first "/" to have a consistent file name split
    const fileNameParts = node.fileName.replace(/^\//, "").split("/");
    fileNameParts.reduce((prevParts, part, i) => {
      // Are we at the last part of the filename, the "file"
      if (fileNameParts.length === i + 1) {
        acc[node.ZUID] = {
          ...node,

          // if this was a string split by "/" use the last part as the label
          label: fileNameParts.length > 1 ? part : node.label,
          parentZUID: prevParts // previous path parts
        };
        acc[node.ZUID].children = [];
      } else {
        // When it's the first path part use it-as-is to avoid prefixing a forward slash
        let combinedParts = i === 0 ? part : `${prevParts}/${part}`;

        // Add directo to map
        acc[combinedParts] = {
          type: "directory",
          ZUID: null,
          isLive: true, // ensure upload action is not shown
          closed: node.closed ? true : false,
          label: part, // current file name part
          path: combinedParts, // previous parent parts combined with current part
          parentZUID: prevParts, // previous path parts
          children: []
        };

        return combinedParts;
      }
    }, "");

    return acc;
  }, {});

  Object.keys(map).forEach(key => {
    const node = { ...map[key] };

    if (node.parentZUID && map[node.parentZUID]) {
      // When a node is added to the tree array it can still have
      // children added to it's array because we pass values by reference
      // our map is the referenced value
      map[node.parentZUID].children.push(node);
      map[node.parentZUID].children.sort((a, b) => {
        let labelA = a.label.toLowerCase().trim(); // ignore upper and lowercase
        let labelB = b.label.toLowerCase().trim(); // ignore upper and lowercase
        if (labelA < labelB) {
          return -1;
        }
        if (labelA > labelB) {
          return 1;
        }

        // names must be equal
        return 0;
      });
    } else {
      tree.push(node);
    }
  });

  return tree;
};
