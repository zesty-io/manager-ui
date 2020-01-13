const ZUID = window.location.host.split(".")[0];

export function instance(
  state = {
    hash: "",
    zuid: ZUID
  },
  action
) {
  switch (action.type) {
    default:
      return state;
  }
}
