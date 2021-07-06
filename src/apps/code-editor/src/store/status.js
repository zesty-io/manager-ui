export function status(
  state = {
    selected: "dev",
    branches: [],
  },
  action
) {
  switch (action.type) {
    case "FETCH_FILES_SUCCESS":
      const branches = action.payload.files.map((file) => file.status);
      return {
        ...state,
        branches: branches.reduce((acc, env) => {
          let exists = acc.find((el) => el === env);
          if (!exists) {
            acc.push(env);
          }
          return acc;
        }, []),
      };

    default:
      return state;
  }
}
