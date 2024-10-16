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
 * TODO given a specific ZUID, determine whether that user is allowed to do a certain action
 * @param {string} action
 * @param {string} zuid - default to instance ZUID
 * e.g. Can user publish content item
 */
export function usePermission(action, zuid = instanceZUID) {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  // We only want to recalculate the permission inputs change
  return useMemo(() => {
    // "With great power comes great responsibility" - Benjamin Franklin Parker
    if (user.staff) {
      return true;
    }

    // Check super
    // super users are allowed all actions across all resources
    if (role.systemRole.super) {
      return true;
    }

    /*
      If the user is not a super user, check granular roles.
      First check specific resource, if not found check instance level.
      TODO: Check additional granular roles for parent resources depending on resource type (e.g. content model when checking content item)
    */
    const granularRole =
      role?.granularRoles?.find((r) => r.resourceZUID === zuid) ||
      role?.granularRoles?.find((r) => r.resourceZUID === instanceZUID);

    // Check system
    switch (action) {
      case "CREATE":
        return granularRole?.create ?? role.systemRole.create;

      case "READ":
        return granularRole?.read ?? role.systemRole.read;

      case "UPDATE":
        return granularRole?.update ?? role.systemRole.update;

      case "DELETE":
        return granularRole?.delete ?? role.systemRole.delete;

      case "PUBLISH":
        return granularRole?.publish ?? role.systemRole.publish;

      // check for specific product access
      // NOTE this has been bolted on to the action check
      // this should get refactored at some point to separate these concepts
      case "CODE":
        // List of role names with access to code editor
        return ["Owner", "Admin", "Developer"].includes(role.systemRole.name);

      default:
        return false;
    }
  }, [user, role, action, zuid]);
}
