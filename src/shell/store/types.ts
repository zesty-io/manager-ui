import { UIState } from "./ui";
import { State as MediaRevampState } from "./media-revamp";
import {
  InstalledApp,
  ModelType,
  ContentItemWithDirtyAndPublishing,
} from "../services/types";
/*
  TODO
  The UI state is well typed but the rest of the application state is entirely
  untyped (i.e. any). Ideally AppState would be completely specified, but that
  would require typing the entire redux store of the app just for this one
  function. For now, the ui member is typed but every other member is any
  Eventually, after the rest of the redux store is typed, we will replace this
  with an AppState that has the proper types
*/
export type AppState = {
  ui: UIState;
  apps: {
    frames: any;
    installed: InstalledApp[];
  };
  auth: {
    checking: boolean;
    valid: boolean;
    sessionEnding: boolean;
  };
  user: any;
  users: any;
  releases: any;
  releaseMembers: any;
  userRole: any;
  products: any;
  instance: any;
  instances: any;
  languages: any;
  models: any;
  fields: any;
  content: Record<string, ContentItemWithDirtyAndPublishing>;
  contentVersions: any;
  mediaRevamp: MediaRevampState;
  media: any;
  logs: any;
  notifications: any;
  platform: any;
  headTags: any;
  instanceApi: any;
  accountsApi: any;
  modal: any;
  listFilters: any;
  logsInView: any;
  // TODO: complete files
  files: {
    dirty: boolean;
    ZUID: string;
    fileName: string;
    status: string;
    type: ModelType;
  }[];
  status: any;
  auditTrail: any;
  headers: any;
  navCode: any;
  leads: any;
  filter: any;
  navSchema: any;
  parents: any;
  redirects: any;
  redirectsFilter: any;
  imports: any;
  settings: any;
  navContent: any;
};
