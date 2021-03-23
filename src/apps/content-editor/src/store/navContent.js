import { request } from "utility/request";
import { notify } from "shell/store/notifications";
import {
  faFile,
  faListAlt,
  faDatabase,
  faExternalLinkSquareAlt,
  faLink,
  faHome
} from "@fortawesome/free-solid-svg-icons";

const ICONS = {
  templateset: faFile,
  pageset: faListAlt,
  dataset: faDatabase,
  external: faExternalLinkSquareAlt,
  internal: faLink,
  item: faFile,
  homepage: faHome
};

export function navContent(
  state = { nav: [], headless: [], hidden: [], raw: [] },
  action
) {
  switch (action.type) {
    case "FETCH_CONTENT_NAV_SUCCESS":
    case "LOADED_LOCAL_CONTENT_NAV":
    case "UPDATE_NAV":
      const tree = buildTree(action.raw);
      const [hidden, headless, nav] = split(tree);

      return {
        ...state,
        raw: action.raw,
        nav,
        headless,
        hidden
      };

    // TODO reload nav when language changes
    // case "LOADED_LOCAL_USER_LANG":
    // case "USER_SELECTED_LANG":

    default:
      return state;
  }
}

export function fetchNav() {
  return (dispatch, getState) => {
    return request(`${CONFIG.API_ACCOUNTS}/roles`)
      .then(data => data.data)
      .then(roles => {
        if (
          roles.length &&
          roles.find(role => {
            return role.entityZUID === getState().instance.ZUID;
          })
        ) {
          const currentRoleZUID = roles.find(role => {
            return role.entityZUID === getState().instance.ZUID;
          }).ZUID;

          return request(
            `${CONFIG.API_ACCOUNTS}/roles/${currentRoleZUID}`
          ).then(data => {
            if (data.data && data.data.granularRoles) {
              return data.data.granularRoles.reduce(
                (acc, grain) => [...acc, grain.resourceZUID],
                []
              );
            }
            return null;
          });
        }
        return null;
      })
      .then(granularRoles => {
        return request(`${CONFIG.API_INSTANCE}/env/nav`).then(res => {
          if (res.status === 200) {
            // enrich nav with stored closed/hidden status
            // FIXME: this should be scoped to the instance
            const closed = localStorage.getItem("zesty:navContent:closed");
            const closedArr = closed ? JSON.parse(closed) : [];
            const closedZUIDS = closedArr.map(node => node.ZUID);

            // FIXME: this should be scoped to the instance
            const hidden = localStorage.getItem("zesty:navContent:hidden");
            const hiddenArr = hidden ? JSON.parse(hidden) : [];
            const hiddenZUIDS = hiddenArr.map(node => node.ZUID);

            const filteredByRole = res.data.filter(el => {
              if (granularRoles) {
                return granularRoles.find(zuid => zuid === el.ZUID);
              } else {
                return el;
              }
            });

            filteredByRole.forEach(node => {
              if (closedZUIDS.includes(node.ZUID)) {
                node.closed = true;
              }
              if (hiddenZUIDS.includes(node.ZUID)) {
                node.hidden = true;
              }

              // Set path
              if (node.type === "item") {
                node.path = `/content/${node.contentModelZUID}/${node.ZUID}`;
              } else if (node.type === "external" || node.type === "internal") {
                node.path = `/content/link/${node.ZUID}`;
              } else {
                node.path = `/content/${node.ZUID}`;
              }

              // Set Icon
              if (node.label.toLowerCase() === "homepage") {
                node.icon = ICONS["homepage"];
              } else {
                node.icon = ICONS[node.type];
              }
            });

            dispatch({
              type: "FETCH_CONTENT_NAV_SUCCESS",
              raw: filteredByRole
            });
          } else {
            dispatch(
              notify({
                message: `Failed to fetch nav`,
                kind: "warn"
              })
            );
            if (res.error) {
              throw new Error(res.error);
            }
          }
        });
      });
  };
}

export function hideNavItem(path) {
  return (dispatch, getState) => {
    const raw = getState().navContent.raw.map(node => {
      if (node.path === path) {
        node.hidden = !node.hidden;
      }
      return node;
    });

    // FIXME: this should be scoped to the instance
    localStorage.setItem(
      "zesty:navContent:hidden",
      JSON.stringify(raw.filter(node => node.hidden))
    );

    dispatch({
      type: "UPDATE_NAV",
      raw
    });
  };
}

export function collapseNavItem(path) {
  return (dispatch, getState) => {
    const raw = getState().navContent.raw.map(node => {
      if (node.path === path) {
        node.closed = !node.closed;
      }
      return node;
    });

    // FIXME: this should be scoped to the instance
    localStorage.setItem(
      "zesty:navContent:closed",
      JSON.stringify(raw.filter(node => node.closed))
    );

    dispatch({
      type: "UPDATE_NAV",
      raw
    });
  };
}

// utility functions

function sortCustom(nav) {
  // Sort alphabetical
  nav.sort((a, b) => {
    if (a.label.toLowerCase() > b.label.toLowerCase()) {
      return 1;
    } else if (a.label.toLowerCase() < b.label.toLowerCase()) {
      return -1;
    } else {
      return 0;
    }
  });

  // Sort by user defined value
  nav.sort((a, b) => {
    if (a.sort > b.sort) {
      return 1;
    } else if (a.sort < b.sort) {
      return -1;
    } else {
      return 0;
    }
  });
}

/**
 * We get the nav data from the API as a linked list.
 * We build it into a tree hash map for the Nav component
 */
function buildTree(nodes) {
  const tree = [];

  // Convert node array to zuid:node map
  let map = nodes.reduce((acc, node) => {
    // exclude dashboard widgets
    if (node.label === "Dashboard Widgets") {
      return acc;
    }

    acc[node.ZUID] = { ...node };

    // Setup container for children nodes
    acc[node.ZUID].children = [];

    return acc;
  }, {});

  Object.keys(map).forEach(zuid => {
    const node = { ...map[zuid] };

    if (node.parentZUID && map[node.parentZUID]) {
      // When a node is added to the tree array it can still have
      // children added to it's array because we pass values by reference
      // our map is the referenced value
      map[node.parentZUID].children.push(node);
    } else {
      tree.push(node);
    }
  });

  sortCustom(tree);

  // sort nested nav children
  Object.keys(map).forEach(zuid => {
    sortCustom(map[zuid].children);
  });

  return tree;
}

/**
 * The content nav is shown as 3 separate navs;
 * 1) nav: this is the primary navigation
 * 2) headless: any root leafs which are datasets
 * 3) hidden: any leaf within the tree, and it's children, that was marked as hidden
 *
 * We need to walk the previously built tree to split it into this separate navs
 * based up on an operation we have defined
 *
 * @param {*} tree
 */
function split(tree) {
  let hidden = [];
  let headless = [];
  let nav = [];

  walk(tree, (tree, leaf) => {
    if (leaf.hidden) {
      // remove leaf from tree
      tree.splice(tree.indexOf(leaf), 1);
      hidden.push(leaf);
    } else if (!leaf.parentZUID) {
      // no parent zuid means this is a root leaf
      if (leaf.type === "dataset") {
        headless.push(leaf);
      } else {
        nav.push(leaf);
      }
    }
  });

  return [hidden, headless, nav];
}

/**
 * Walk our tree and perform a user provided operation on each leaf
 * @param {*} tree
 * @param {*} operate
 */
function walk(tree, operate) {
  tree.forEach(leaf => {
    // optimization: if a leaf is hidden then we do not need to
    // continue walking this branch as all of it's children should remain hidden as well
    if (!leaf.hidden) {
      if (Array.isArray(leaf.children) && leaf.children.length) {
        walk(leaf.children, operate);
      }
    }

    // ensure we operate on every leaf on this branch
    operate(tree, leaf);
  });
}
