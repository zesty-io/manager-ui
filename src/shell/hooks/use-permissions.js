"use strict";

import { useStore } from "react-redux";

/**
 * TODO given a specific ZUID, determine whether that user is allowed to do a certain action
 * e.g. Can user publish content item
 */
export function usePermission(action, zuid) {
  const store = useStore();
  const state = store.getState();
  const role = state.userRole;

  // "With great power comes great responsibility" - Uncle Ben
  if (state.user.staff) {
    return state.user.staff;
  }

  // Check super
  // super users are allowed all actions across all resources
  if (role.systemRole.super) {
    return role.systemRole.super;
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
      false;
  }
}
