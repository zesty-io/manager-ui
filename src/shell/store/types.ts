import { UIState } from "./ui";
/*
  TODO
  The UI state is well typed but the rest of the application state is entirely
  untyped (i.e. any). Ideally AppState would be completely specified, but that
  would require typing the entire redux store of the app just for this one
  function. For now, the ui member is typed but every other member is any

  Eventually, after the rest of the redux store is typed, we will replace this
  with an imported AppState that has the proper types
*/
export type AppState = { ui: UIState } & { [key: string]: any };
