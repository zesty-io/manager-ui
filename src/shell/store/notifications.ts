// @ts-check
type Action = {
  type: "NEW_NOTIFICATION" | "REMOVE_NOTIFICATION";
  data: Data;
  epoch: Date;
};

export function notifications(state = [], action: Action) {
  switch (action.type) {
    case "NEW_NOTIFICATION":
      return [action.data, ...state];

    case "REMOVE_NOTIFICATION":
      return state.map((notification) => {
        if (notification.epoch === action.epoch) {
          notification.active = false;
        }
        return notification;
      });

    default:
      return state;
  }
}

type Data = {
  kind: "warn" | "error";
  HTML?: any;
  message?: string;
};

export function notify(data: Data) {
  if (!data.message && !data.HTML) {
    throw new Error("Cannot trigger notification without a message");
  }

  // future implementation will include
  // a notificaiton in line with the one
  // in accounts-ui
  return {
    type: "NEW_NOTIFICATION",
    data: {
      ...data,
      active: true,
      epoch: Date.now(),
    },
  };
}

export function remove(epoch: Date) {
  if (!epoch) {
    throw new Error("Cannot remove notification without epoch timestamp");
  }
  return {
    type: "REMOVE_NOTIFICATION",
    epoch,
  };
}
