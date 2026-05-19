import {
  IntegrationTypes,
  IntegrationKeyPaths,
  IntegrationFieldConfig,
} from "../../services/types";

export type FormTypes = "select" | "configure";

export type IntegrationDisplayProps = {
  [key: string]: string;
};

export type ApiResponse<T> = {
  status: "success" | "error";
  data?: T;
};

export type ApiDataProps = Record<string, any>;

export type ApiDataWithIdProps = ApiDataProps & { _itemId: string };

export type ListItemDataProps = {
  type: IntegrationTypes;
  items: ApiDataWithIdProps[];
  selectedItems: ApiDataWithIdProps[];
  keyPaths: IntegrationKeyPaths;
  onSelect: (item: ApiDataWithIdProps) => void;
  maxItems?: number;
  onDelete?: (id: string) => void;
  onView?: (data: any) => void;
};

export type FieldTypeIntegrationProps = {
  name: string;
  label: string;
  description?: string;
  formType?: FormTypes;
  required?: boolean;
  value?: any | null;
  onChange?: (value: any) => void;
  error?: string | [string, string][] | null;
  integrationFieldConfig?: IntegrationFieldConfig | null;
  maxItems?: number | null;
  isLoading?: boolean;
  isUpdate?: boolean;
};

export type DisplayOptionCardProps = {
  title: string;
  description: string;
  type: IntegrationTypes;
  card: Omit<IntegrationKeyPaths, "details"> & {
    details?: {
      key: string;
      value: string | number;
    }[];
  };
  disabled?: boolean;
  disableMenu?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export type KeyValueOption = {
  keyPath: string;
  value: any;
};

type ConfigTypes = "option" | "text";

export type ConfigProps = {
  name: string;
  label: string;
  type: ConfigTypes;
  isRequired?: boolean;
  description?: string;
  placeholder?: string;
};
