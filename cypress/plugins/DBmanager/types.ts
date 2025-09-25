import {
  ContentModel,
  ContentItem,
  ContentModelField,
  Web as WebType,
  Meta as MetaTye,
  ModelType,
} from "../../../src/shell/services/types";

export type Model = Partial<ContentModel>;
export type Field = Partial<ContentModelField>;

export type Meta = Partial<MetaTye>;
export type Web = Partial<WebType>;
export type Data = {
  [key: string]: number | string | null | undefined;
};

export type Item = {
  meta?: Meta;
  data?: Data;
  web?: Web;
  [key: string]: any;
};
export type FieldTypes =
  | "text"
  | "textarea"
  | "wysiwyg_basic"
  | "wysiwyg_advanced"
  | "date"
  | "images"
  | "article_writer"
  | "dropdown"
  | "link"
  | "internal_link"
  | "datetime"
  | "yes_no"
  | "fontawesome"
  | "number"
  | "currency"
  | "color"
  | "uuid"
  | "files"
  | "sort"
  | "markdown"
  | "one_to_one"
  | "one_to_many"
  | "block_selector";

export type CypressENV = {
  API_AUTH: string;
  API_INSTANCE_URL: string;
  MEDIA_MANAGER_URL: string;
  COOKIE_NAME: string;
  COMMIT_ID: string;
  TOKEN?: string;
  BIN_ID?: string;
  SITE_ID?: string;
  ECO_ID?: string;
  STORAGE_NAME?: string;
  COMMON?: {
    CONTENT?: {
      model: string;
      item?: string;
      fields?: { [key: string]: any };
      items?: string[];
      media?: string[];
    };
    MODEL?: {
      ZUID: string;
      label?: string;
      name: string;
      type: string;
    };
    ITEM?: {
      ZUID: string;

      data: { [key: string]: any };
    };
    FIELDS?: { [key: string]: any };
    ITEMS?: {
      ZUID: string;
      metaTitle?: string;
      pathPart: string;
      data: { [key: string]: any };
    }[];
    MEDIA?: { id: string; url: string; filename: string }[];
  };
  CURRENT_SPEC?: {
    fileName: string | null | undefined;
    dir: string | null | undefined;
    group: string | null | undefined;
    specLabel: string | null | undefined;
  };
  [key: string]: any;
};

export type CypressEnv0 = {
  API_AUTH: string;
  API_INSTANCE_URL: string;
  MEDIA_MANAGER_URL: string;
  COOKIE_NAME: string;
  COMMIT_ID: string;
  TOKEN?: string;
  COMMON?: {
    CONTENT: CommonData;
  };
  CURRENT_SPEC?: {
    fileName: string | null | undefined;
    dir: string | null | undefined;
    group: string | null | undefined;
    specLabel: string | null | undefined;
  };
  BIN_ID?: string;
  SITE_ID?: string;
  ECO_ID?: string;
  STORAGE_NAME?: string;
  [key: string]: any;
};

export type CypressConfig = Cypress.ConfigOptions & {
  env: CypressENV;
  baseUrl: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  status: string;
  data: {
    data: string;
  };
  meta: {
    userZuid: string;
    token: string;
  };
  code: number;
};

export type CreateFieldsResponse = {
  name: string;
  ZUID: string | null;
};

export type CommonDataType = "CONTENT" | "CODE";

export type ContentData = {
  model: Model;
  fields?: Field[];
  item?: Item;
  items: Item[];
  // common?: CommonData | undefined;
};

export type CommonData = {
  model: Model;
  fields: CreateFieldsResponse[];
  item: Item;
  items: Item[];
  media?: any[];
};

export type ApiResponse<T = any> = {
  status: "success" | "error";
  data: T;
};

export type JsonData = {
  meta?: Meta;
  data?: any;
};

export type SetModelProps = {
  [K in FieldTypes]: {
    properties: { [F in keyof Omit<Field, "ZUID" | "name" | "type">]: any };
    value: any;
  };
};

export type AllFieldsProps = {
  [K in FieldTypes]: Field;
};

export type FieldWithValue = (Field & { _value?: any }) | null;

export type CreateContentProps = {
  model?: Model | null | undefined;
  fields?: FieldWithValue[] | [] | null;
};

export type MediaFile = {
  id: string;
  bin_id: string;
  group_id: string;
  filename: string;
  title: string;
  url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  deleted_from_storage_at?: string | null;
};
export type BeforeRunScripts = () => void;
