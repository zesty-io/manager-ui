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
  type: string;
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
