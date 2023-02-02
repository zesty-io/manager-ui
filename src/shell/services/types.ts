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

export interface ContentModel {
  ZUID: string;
  masterZUID: string;
  parentZUID: string;
  description: string;
  label: string;
  metaTitle?: any;
  metaDescription?: any;
  metaKeywords?: any;
  type: "pageset" | "templateset" | "dataset";
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
  contentModelName?: any;
  sort: number;
  listed: boolean;
  version: number;
  langID: number;
  createdAt: string;
  updatedAt: string;
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
  siblings: [{ [key: number]: { value: string; id: number } }] | [];
  data: Data;
  publishAt?: any;
}

export interface FieldSettingsOptions {
  [key: string]: string;
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
  [key: string]: ContentModelFieldValue;
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
