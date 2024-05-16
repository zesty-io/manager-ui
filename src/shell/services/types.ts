export interface Publishing {
  ZUID: string;
  createdAt: string;
  itemZUID: string;
  message: string | null;
  publishAt: string;
  publishedByUserZUID: string;
  unpublishAt: string;
  updatedAt: string;
  version: number;
  versionZUID: string;
  _active: boolean;
}

export interface Bin {
  id: string;
  name: string;
  site_id?: string;
  eco_id?: string;
  storage_driver: string;
  storage_name: string;
  storage_base_url: string;
  cdn_driver: string;
  cdn_base_url: string;
  created_at: string;
  deleted_at?: Date;
  deleted_from_storage_at?: Date;
  default: boolean;
}

export interface GroupData {
  id: string;
  bin_id: string;
  group_id: string;
  name: string;
  storage_driver: string;
  storage_name: string;
  groups: Group[];
  files: File[];
}

export interface Group {
  id: string;
  bin_id: string;
  group_id: string;
  name: string;
  created_at?: string;
}

export interface File {
  id: string;
  bin_id: string;
  group_id: string;
  filename: string;
  title: string;
  url: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_from_storage_at?: string;
  thumbnail: string;
}

export type ModelType = "pageset" | "templateset" | "dataset";

export interface ContentModel {
  ZUID: string;
  masterZUID: string;
  parentZUID: string;
  description: string;
  label: string;
  metaTitle?: any;
  metaDescription?: any;
  metaKeywords?: any;
  type: ModelType;
  name: string;
  sort: number;
  listed: boolean;
  createdByUserZUID: string;
  updatedByUserZUID: string;
  createdAt: string;
  updatedAt: string;
  module?: number;
  plugin?: number;
}
export interface Web {
  version: number;
  versionZUID: string;
  metaDescription: string;
  metaTitle: string;
  metaLinkText: string;
  metaKeywords?: any;
  parentZUID?: any;
  pathPart: string;
  path: string;
  sitemapPriority: number;
  canonicalTagMode: number;
  canonicalQueryParamWhitelist?: any;
  canonicalTagCustomValue?: any;
  createdByUserZUID: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meta {
  ZUID: string;
  zid: number;
  masterZUID: string;
  contentModelZUID: string;
  sort: number;
  listed: boolean;
  version: number;
  langID: number;
  createdAt: string;
  updatedAt: string;
  createdByUserZUID: string;
}
export interface Data {
  [key: string]: number | string | null | undefined;
}

type UnorderedQuery = {
  limit?: number;
  startDate?: string;
  endDate?: string;
  query: string;
};

type OrderedQuery = UnorderedQuery & {
  order?: "created" | "modified" | "name";
  dir: "asc" | "desc";
};

export type SearchQuery = UnorderedQuery | OrderedQuery;

export interface ContentItem {
  web: Web;
  meta: Meta;
  siblings: [{ [key: number]: { value: string; id: number } }] | [];
  data: Data;
  publishAt?: any;
}

export type ContentItemWithDirtyAndPublishing = ContentItem & {
  dirty: boolean;
  publishing: Publishing;
  scheduling: any;
};

export interface Instance {
  ID: number;
  ZUID: string;
  blueprintID: number;
  blueprintZUID: string;
  cancelledReason: string | null;
  createdAt: string;
  createdByUserZUID: string;
  domain: string;
  ecoID: string | null;
  ecoZUID: string | null;
  legacy: boolean;
  name: string;
  planID: number;
  prefs: string | null;
  randomHashID: string;
  requiresTwoFactor: number;
  screenshotURL: string;
  updatedAt: string;
  useTLS: boolean;
}

export interface HeadTag {
  ZUID: string;
  type: string;
  attributes: {
    [key: string]: string;
  };
  resourceZUID: string;
  sort: number;
  createdByUserZUID: string;
  updatedByUserZUID: string;
  createdAt: string;
  updatedAt: string;
}

export interface FieldSettingsOptions {
  [key: string | number]: string;
}

export interface FieldSettings {
  options?: FieldSettingsOptions;
  group_id?: string;
  limit?: number;
  list: boolean;
  tooltip?: string;
  defaultValue?: string;
}

export type ContentModelFieldValue =
  | string
  | number
  | boolean
  | FieldSettings
  | FieldSettingsOptions[];

export type ContentModelFieldDataType =
  | "text"
  | "wysiwyg_basic"
  | "wysiwyg_advanced"
  | "article_writer"
  | "markdown"
  | "textarea"
  | "one_to_many"
  | "one_to_one"
  | "uuid"
  | "number"
  | "date"
  | "datetime"
  | "images"
  | "yes_no"
  | "dropdown"
  | "link";

export interface ContentModelField {
  ZUID: string;
  contentModelZUID: string;
  name: string;
  label: string;
  description: string;
  datatype: ContentModelFieldDataType;
  sort: number;
  required?: boolean;
  relationship?: any;
  options?: any;
  fieldOptions?: any;
  datatypeOptions: string;
  settings: FieldSettings;
  relatedModelZUID?: any;
  relatedFieldZUID?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

export interface WebView {
  ZUID: string;
  status: "live" | "dev";
  contentModelZUID: string;
  contentModelType: string;
  code: string;
  type: string;
  fileName: string;
  customZNode: number;
  template: number;
  lastEditedID?: number;
  module: number;
  plugin: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditMeta {
  uri: string;
  url: string;
  message: string;
}

export interface Audit {
  ZUID: string;
  resourceType: "content" | "schema" | "code" | "settings";
  affectedZUID: string;
  actionByUserZUID: string;
  entityZUID: string;
  action: number;
  meta: AuditMeta;
  happenedAt: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface User {
  ID: number;
  ZUID: string;
  authSource: string | null;
  authyEnabled?: boolean;
  authyPhoneCountryCode: string | null;
  authyPhoneNumber: string | null;
  authyUserID: string | null;
  createdAt: string;
  email: string;
  emailHash?: string;
  firstName: string;
  lastLogin: string;
  lastName: string;
  prefs: string | null;
  signupInfo: string | null;
  staff: boolean;
  unverifiedEmails: string | null;
  updatedAt: string;
  verifiedEmails: string | null;
  websiteCreator: boolean;
}

export interface SystemRole {
  ZUID: string;
  create: boolean;
  createdAt: string;
  delete: boolean;
  grant: boolean;
  name: string;
  publish: boolean;
  read: boolean;
  super: boolean;
  update: boolean;
  updatedAt: string;
}

export type GranularRole = SystemRole & { resourceZUID: string };

export interface Role {
  ZUID: string;
  createdAt: string;
  createdByUserZUID: string;
  entityZUID: string;
  expiry: string | null;
  granularRoleZUID: string | null;
  granularRoles: GranularRole[] | null;
  name: string;
  static: boolean;
  systemRole: SystemRole;
  systemRoleZUID: string;
  updatedAt: string;
}

export interface UserRole {
  ID: number;
  ZUID: string;
  authSource: string | null;
  authyEnabled?: boolean;
  authyPhoneCountryCode: string | null;
  authyPhoneNumber: string | null;
  authyUserID: string | null;
  createdAt: string;
  email: string;
  firstName: string;
  lastLogin: string;
  lastName: string;
  prefs: string | null;
  role: Role;
  signupInfo: string | null;
  staff: boolean;
  unverifiedEmails: string | null;
  updatedAt: string;
  verifiedEmails: string | null;
  websiteCreator: boolean;
}

export interface Domain {
  ZUID: string;
  instanceZUID: string;
  domain: string;
  branch: string;
  createdByUserZUID: string;
  updatedByUserZUID: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface LegacyHeader {
  ID: number;
  active: number;
  comment: string | null;
  createdAt: string;
  isLocked: number | null;
  keys: string;
  module: number;
  nodeName: string;
  plugin: number;
  resourceZUID: string;
  sort: number;
  template: number;
  type: string;
  updatedAt: string;
  value: string | null;
}

export interface InstanceSetting {
  ID: number;
  ZUID: string;
  category: string;
  key: string;
  keyFriendly: string;
  value: string;
  admin?: boolean;
  parsleyAccess?: boolean;
  dataType: string;
  options: string;
  tips: string;
  createdAt: string;
  updatedAt: string;
}

export type Products =
  | "launchpad"
  | "content"
  | "media"
  | "schema"
  | "code"
  | "leads"
  | "reports"
  | "redirects"
  | "settings"
  | "release"
  | "apps";

type ContentNavItemType =
  | "dataset"
  | "external"
  | "internal"
  | "item"
  | "pageset"
  | "redirect";

export interface ContentNavItem {
  ZUID: string;
  label: string;
  sort: number;
  type: ContentNavItemType;
  contentModelZUID?: string;
  parentZUID?: string;
}

export interface Stylesheet {
  ZUID: string;
  status: "live" | "dev";
  type: string;
  fileName: string;
  code: string;
  lastEditedID: number;
  template: number;
  module: number;
  plugin: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Script {
  ZUID: string;
  status: "live" | "dev";
  type: string;
  fileName: string;
  code: string;
  lastEditedID: number;
  template: number;
  module: number;
  plugin: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = "schema" | "content" | "code" | "media";

export interface Language {
  ID: number;
  active: boolean;
  code: string;
  createdAt: string;
  default: boolean;
  name: string;
  updatedAt: string;
}

export interface InstalledApp {
  ZUID: string;
  appZUID: string;
  createdAt: string;
  createdByUserZUID: string;
  description: string | null;
  label: string;
  name: string;
  public: boolean;
  publisher: string;
  updatedAt: string;
  url: string;
}

export type StyleCategory = {
  ID: number;
  name: string;
  icon: string;
  sort: number;
  options: any;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Announcement = {
  zuid: string;
  title: string;
  description: string;
  feature_image: {
    type: string;
    totalItems: number;
    data: {
      type: string;
      zuid: string;
      url: string;
    }[];
  };
  cta_type: "play_video" | "schedule_training";
  announcement_link: string;
  training_link: string;
  video_link: string;
  start_date_and_time: string;
  end_date_and_time: string;
  created_at: string;
};
