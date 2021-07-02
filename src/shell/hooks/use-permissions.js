"use strict";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const getUser = (state) => state.user;
const getRole = (state) => state.userRole;
const selectUser = createSelector([getUser], (user) => user);
const selectRole = createSelector([getRole], (role) => role);

/**
 * TODO given a specific ZUID, determine whether that user is allowed to do a certain action
 * e.g. Can user publish content item
 */
export function usePermission(action, zuid = "") {
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

    // Check granular
    // TODO check granular permission on specific ZUID
    //   const granular = () => {
    //     return false;
    //   };

    // Check system
    switch (action) {
      case "CREATE":
        return role.systemRole.create;

      case "READ":
        return role.systemRole.read;

      case "UPDATE":
        return role.systemRole.update;

      case "DELETE":
        return role.systemRole.delete;

      case "PUBLISH":
        return role.systemRole.publish;

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
