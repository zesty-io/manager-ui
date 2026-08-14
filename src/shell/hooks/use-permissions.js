"use strict";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import instanceZUID from "../../utility/instanceZUID";

const getUser = (state) => state.user;
const getRole = (state) => state.userRole;
const selectUser = createSelector([getUser], (user) => user);
const selectRole = createSelector([getRole], (role) => role);

/**
 * System roles that grant code access. These are the same roles that receive
 * the "code" product in shell/store/products.js, so entitlement stays
 * consistent with what the global menu already grants.
 *
 * Matched by ZUID rather than by systemRole.name: names are editable and a
 * renamed role would silently lose or gain access.
 */
const CODE_ROLE_ZUIDS = [
  "31-71cfc74-0wn3r", // owner
  "31-71cfc74-4dm13", // admin
  "31-71cfc74-4cc4dm13", // account admin
  "31-71cfc74-d3v3l0p3r", // developer
  "31-71cfc74-d3vc0n", // dev console
];

export function hasPermission(user, role, action, zuid = instanceZUID) {
  // "With great power comes great responsibility" - Benjamin Franklin Parker
  if (user?.staff || role?.systemRole?.super) {
    return true;
  }

  const granularRole =
    role?.granularRoles?.find((r) => r.resourceZUID === zuid) ||
    role?.granularRoles?.find((r) => r.resourceZUID === instanceZUID);

  switch (action) {
    case "CREATE":
      return granularRole?.create ?? role?.systemRole?.create;

    case "READ":
      return granularRole?.read ?? role?.systemRole?.read;

    case "UPDATE":
      return granularRole?.update ?? role?.systemRole?.update;

    case "DELETE":
      return granularRole?.delete ?? role?.systemRole?.delete;

    case "PUBLISH":
      return granularRole?.publish ?? role?.systemRole?.publish;

    case "CODE":
      return CODE_ROLE_ZUIDS.includes(role?.systemRoleZUID);

    default:
      return false;
  }
}

/**
 * TODO given a specific ZUID, determine whether that user is allowed to do a certain action
 * @param {string} action
 * @param {string} zuid - default to instance ZUID
 * e.g. Can user publish content item
 */
export function usePermission(action, zuid = instanceZUID) {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  return useMemo(
    () => hasPermission(user, role, action, zuid),
    [user, role, action, zuid]
  );
}

export function useMultiPermission(action, zuids) {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);
  const key = zuids?.join("|") || "";

  return useMemo(() => {
    if (!zuids?.length) return true;
    return zuids.every((zuid) => hasPermission(user, role, action, zuid));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, action, key]);
}
