import { request } from "utility/request";

const ICONS = {
  templateset: "fas fa-file",
  pageset: "fas fa-list-alt",
  dataset: "fas fa-database",
  external: "fas fa-external-link-square-alt",
  internal: "fas fa-link",
  item: "fas fa-file",
  homepage: "fas fa-home"
};

export function contentNav(
  state = { nav: [], headless: [], hidden: [], raw: [] },
  action
) {
  switch (action.type) {
    case "FETCH_CONTENT_NAV_SUCCESS":
    case "LOADED_LOCAL_CONTENT_NAV":
      return {
        ...state,
        raw: action.raw,
        nav: buildNavTree(action.raw),
        headless: buildHeadlessTree(action.raw),
        hidden: buildHiddenTree(action.raw)
      };

    // TODO reload nav when language changes
    // case "LOADED_LOCAL_USER_LANG":
    // case "USER_SELECTED_LANG":

    case "UPDATE_NAV":
      return {
        ...state,
        raw: action.raw,
        nav: buildNavTree(action.raw),
        headless: buildHeadlessTree(action.raw),
        hidden: buildHiddenTree(action.raw)
      };

    default:
      return state;
  }
}

export function fetchNav() {
  return dispatch => {
    return request(`${CONFIG.API_ACCOUNTS}/roles`)
      .then(data => data.data)
      .catch(err => {
        dispatch({ type: "USER_ROLE_ERROR" });
        throw new Error("Unable to load user data", err);
      })
      .then(roles => {
        dispatch({ type: "USER_ROLES", data: { roles } });
        if (
          roles.length &&
          roles.find(role => {
            return role.entityZUID === zesty.instance.zuid;
          })
        ) {
          const currentRoleZUID = roles.find(role => {
            return role.entityZUID === zesty.instance.zuid;
          }).ZUID;
          return request(
            `//${CONFIG.API_ACCOUNTS}/roles/${currentRoleZUID}`
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
        return request(`${CONFIG.API_INSTANCE}/env/nav`)
          .then(data => {
            if (data.status === 400) {
              notify({
                message: `Failure fetching nav: ${data.error}`,
                kind: "error"
              });
            } else if (!data || !data.data) {
              return console.error("no data returned from fetch sets");
            } else {
              // enrich nav with stored closed/hidden status
              const closed = localStorage.getItem("zesty:contentNav:closed");
              const closedArr = closed ? JSON.parse(closed) : [];
              const closedZUIDS = closedArr.map(node => node.ZUID);

              const hidden = localStorage.getItem("zesty:contentNav:hidden");
              const hiddenArr = hidden ? JSON.parse(hidden) : [];
              const hiddenZUIDS = hiddenArr.map(node => node.ZUID);

              const filteredByRole = data.data.filter(el => {
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
                } else if (
                  node.type === "external" ||
                  node.type === "internal"
                ) {
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
            }
          })
          .catch(() => {
            throw new Error("Unable to load nav data");
          });
      });
  };
}

export function hideNavItem(path) {
  return (dispatch, getState) => {
    const raw = getState().contentNav.raw.map(node => {
      if (node.path === path) {
        node.hidden = !node.hidden;
      }
      return node;
    });

    localStorage.setItem(
      "zesty:contentNav:hidden",
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
    const raw = getState().contentNav.raw.map(node => {
      if (node.path === path) {
        node.closed = !node.closed;
      }
      return node;
    });

    localStorage.setItem(
      "zesty:contentNav:closed",
      JSON.stringify(raw.filter(node => node.closed))
    );

    dispatch({
      type: "UPDATE_NAV",
      raw
    });
  };
}

// utility functions

function buildNavTree(nodes) {
  const tree = buildTree(nodes.filter(node => !node.hidden));

  // filter out top level datasets
  const nav = tree
    .filter(node =>
      node.type === "dataset" && !node.parentZUID ? false : true
    )
    .filter(node => !node.hidden);

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

  return nav;
}

function buildHeadlessTree(nodes) {
  const filteredNodes = nodes.filter(node => {
    if (node.hidden) {
      return false;
    }
    if (node.parentZUID) {
      return false;
    } else {
      if (
        node.type === "dataset" &&
        node.label !== "Dashboard Widgets" &&
        node.label !== "Widgets"
      ) {
        return true;
      } else {
        return false;
      }
    }
  });

  return buildTree(filteredNodes);
}

function buildHiddenTree(nodes) {
  return buildTree(nodes.filter(node => node.hidden));
}

function buildTree(nodes) {
  const tree = [];

  let map = nodes.reduce((acc, node) => {
    acc[node.ZUID] = { ...node };
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

  return tree;
}
