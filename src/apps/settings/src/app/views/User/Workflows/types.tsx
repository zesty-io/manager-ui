export const COLOR_NAMES = {
  BLUE: "Blue",
  DEEP_PURPLE: "Deep Purple",
  GREEN: "Green",
  ORANGE: "Orange",
  PINK: "Pink",
  PURPLE: "Purple",
  RED: "Red",
  ROSE: "Rose",
  YELLOW: "Yellow",
  GREY: "Grey",
} as const;

export const COLOR_HEX = {
  BLUE: "#0BA5EC",
  DEEP_PURPLE: "#4E5BA6",
  GREEN: "#12b76a",
  ORANGE: "#FF5C08",
  PINK: "#EE46BC",
  PURPLE: "#7A5AF8",
  RED: "#F04438",
  ROSE: "#F63D68",
  YELLOW: "#F79009",
  GREY: "#667085",
} as const;

export const AUTHORIZED_ROLES: string[] = ["Admin", "Owner"];

export const ROLE_SORT_ORDER = { Owner: 0, Admin: 1 };

type ObjectConstants<Type> = Type[keyof Type];

export type ColorNameTypes = ObjectConstants<typeof COLOR_NAMES>;
export type ColorHexTypes = ObjectConstants<typeof COLOR_HEX>;
export type AuthorizedRoles = typeof AUTHORIZED_ROLES[number];

export type StatusLabelQuery = {
  ZUID: string;
  name: string;
  description: string | undefined;
  color: ColorHexTypes;
  allowPublish: boolean;
  sort: number;
  addPermissionRoles: string[] | undefined;
  removePermissionRoles: string[] | undefined;
  createdByUserZUID: string;
  updatedByUserZUID: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | undefined;
};

export type StatusLabel = Omit<
  StatusLabelQuery,
  | "createdByUserZUID"
  | "updatedByUserZUID"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type UpdateStatusLabel = Omit<
  StatusLabelQuery,
  | "createdByUserZUID"
  | "updatedByUserZUID"
  | "createdAt"
  | "updatedAt"
  | "deletedAt"
>;

export type CreateStatusLabel = Partial<Omit<StatusLabel, "ZUID" | "sort">>;

export type UpdateSortingOrder = Pick<StatusLabelQuery, "ZUID" | "sort">;

export type StatusLabelsColorMenu = {
  label: ColorNameTypes;
  value: ColorHexTypes;
};

export type StatusLabelsRoleMenu = {
  label: string;
  value: string;
};

export const colorMenu: StatusLabelsColorMenu[] = Object.keys(COLOR_NAMES).map(
  (key) => ({
    label: COLOR_NAMES[key as keyof typeof COLOR_NAMES],
    value: COLOR_HEX[key as keyof typeof COLOR_HEX],
  })
);
