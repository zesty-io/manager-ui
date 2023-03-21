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
  version?: number;
  versionZUID?: string;
  metaDescription?: string;
  metaTitle: string;
  metaLinkText: string;
  metaKeywords?: any;
  parentZUID?: any;
  pathPart: string;
  path?: string;
  sitemapPriority?: number;
  canonicalTagMode: number;
  canonicalQueryParamWhitelist?: any;
  canonicalTagCustomValue?: any;
  createdByUserZUID?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Meta {
  ZUID?: string;
  zid?: number;
  masterZUID?: string;
  contentModelZUID: string;
  contentModelName?: any;
  sort?: number;
  listed?: boolean;
  version?: number;
  langID?: number;
  createdAt?: string;
  updatedAt?: string;
  createdByUserZUID: string;
}
export interface Data {
  content: string;
  david_uuid: string;
  habibi: string;
  image: string;
  image_1: string;
  image_2?: any;
  image_3?: any;
  image_4?: any;
  image_5?: any;
  title: string;
}

export interface ContentItem {
  web: Web;
  meta: Meta;
  siblings?: [{ [key: number]: { value: string; id: number } }] | [];
  data?: Data;
  publishAt?: any;
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
}

export type ContentModelFieldValue =
  | string
  | number
  | boolean
  | FieldSettings
  | FieldSettingsOptions[];

export interface ContentModelField {
  ZUID: string;
  contentModelZUID: string;
  name: string;
  label: string;
  description: string;
  datatype: string;
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
  resourceType: "content" | "schema" | "code";
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
  ZUID: string;
  ID: number;
  firstName: string;
  lastName: string;
  email: string;
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

export interface Role {
  ZUID: string;
  createdAt: string;
  createdByUserZUID: string;
  entityZUID: string;
  expiry: string | null;
  granularRoleZUID: string | null;
  granularRoles: string | null;
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
