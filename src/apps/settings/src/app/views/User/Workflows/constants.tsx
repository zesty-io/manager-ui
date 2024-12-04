export const COLOR_NAMES = {
  BLUE: "Blue",
  PINK: "Pink",
  PURPLE: "Purple",
  RED: "Red",
  DEEP_PURPLE: "Deep Purple",
  GREEN: "Green",
  YELLOW: "Yellow",
  ROSE: "Rose",
  ORANGE: "Orange",
  GREY: "Grey",
} as const;

export const COLOR_HEX = {
  BLUE: "#0ba5ec",
  PINK: "#ee46bc",
  PURPLE: "#7a5af8",
  RED: "#f04438",
  DEEP_PURPLE: "#4e5ba6",
  GREEN: "#12b76a",
  YELLOW: "#f79009",
  ROSE: "#f63d68",
  ORANGE: "#ff5c08",
  GREY: "#667085",
} as const;

export const ROLE_NAMES = {
  OWNER: "Owner",
  STAFF: "Staff",
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  PUBLISHER: "Publisher",
  CONTRIBUTOR: "Contributor",
  SEO: "SEO",
} as const;

export const ROLE_ZUIDS = {
  OWNER: "31-71cfc74-0wn3r",
  STAFF: "31-71cfc74-1fg6t", //TO DO: Get correct ZUID
  ADMIN: "31-71cfc74-4dm13",
  DEVELOPER: "31-71cfc74-d3v3l0p3r",
  PUBLISHER: "31-71cfc74-p0bl1shr",
  CONTRIBUTOR: "31-71cfc74-c0ntr1b0t0r",
  SEO: "31-71cfc74-s30",
} as const;

export const DEFAULT_STATUS_ZUIDS = {
  DRAFT: "26-14b315-d24ft",
  NEEDS_REVIEW: "26-n33d5-23v13w",
  APPROVED: "26-14b315-4pp20v3d",
} as const;

export const DEFAULT_STATUS_NAMES = {
  DRAFT: "Draft",
  NEEDS_REVIEW: "Needs Review",
  APPROVED: "Approved",
} as const;

export const DEFAULT_STATUS_DESC = {
  DRAFT: "Content item is only available to preview in stage",
  NEEDS_REVIEW: "Content item is available to preview in stage",
  APPROVED: "Content item is available to publish",
} as const;

type ObjectConstants<Type> = Type[keyof Type];

export type ColorNameTypes = ObjectConstants<typeof COLOR_NAMES>;

export type ColorHexTypes = ObjectConstants<typeof COLOR_HEX>;

export type RoleNameTypes = ObjectConstants<typeof ROLE_NAMES>;

export type RoleZuidTypes = ObjectConstants<typeof ROLE_ZUIDS>;

export type DefaultStatusNameTypes = ObjectConstants<
  typeof DEFAULT_STATUS_NAMES
>;

export type DefaultStatusZuidTypes = ObjectConstants<
  typeof DEFAULT_STATUS_ZUIDS
>;

export type DefaultStatusDescTypes = ObjectConstants<
  typeof DEFAULT_STATUS_DESC
>;

export type StatusLabelProps = {
  sort: number;
  zuid: string;
  name: string;
  description: string;
  color: ColorHexTypes;
  allowPublish?: boolean;
  addPermissionRole?: string;
  removePermissionRole?: string;
};

export type CreateStatusLabelProps = {
  name: string;
  description: string;
  color: ColorHexTypes;
  allowPublish?: boolean;
  addPermissionRole?: string;
  removePermissionRole?: string;
};

export const defaultStatusLabels = [
  {
    zuid: DEFAULT_STATUS_ZUIDS.DRAFT,
    name: DEFAULT_STATUS_NAMES.DRAFT,
    description: DEFAULT_STATUS_DESC.DRAFT,
    color: COLOR_HEX.BLUE,
  },
  {
    zuid: DEFAULT_STATUS_ZUIDS.NEEDS_REVIEW,
    name: DEFAULT_STATUS_NAMES.NEEDS_REVIEW,
    description: DEFAULT_STATUS_DESC.NEEDS_REVIEW,
    color: COLOR_HEX.ORANGE,
  },
  {
    zuid: DEFAULT_STATUS_ZUIDS.APPROVED,
    name: DEFAULT_STATUS_NAMES.APPROVED,
    description: DEFAULT_STATUS_DESC.APPROVED,
    color: COLOR_HEX.GREEN,
  },
];

export type ColorMenuProps = {
  label: ColorNameTypes;
  value: ColorHexTypes;
};

export type RoleMenuProps = {
  label: RoleNameTypes;
  value: RoleZuidTypes;
};

export const colorMenu: ColorMenuProps[] = [
  {
    label: COLOR_NAMES.BLUE,
    value: COLOR_HEX.BLUE,
  },
  {
    label: COLOR_NAMES.PINK,
    value: COLOR_HEX.PINK,
  },
  {
    label: COLOR_NAMES.PURPLE,
    value: COLOR_HEX.PURPLE,
  },
  {
    label: COLOR_NAMES.RED,
    value: COLOR_HEX.RED,
  },
  {
    label: COLOR_NAMES.DEEP_PURPLE,
    value: COLOR_HEX.DEEP_PURPLE,
  },
  {
    label: COLOR_NAMES.GREEN,
    value: COLOR_HEX.GREEN,
  },
  {
    label: COLOR_NAMES.YELLOW,
    value: COLOR_HEX.YELLOW,
  },
  {
    label: COLOR_NAMES.ROSE,
    value: COLOR_HEX.ROSE,
  },
  {
    label: COLOR_NAMES.ORANGE,
    value: COLOR_HEX.ORANGE,
  },
  {
    label: COLOR_NAMES.GREY,
    value: COLOR_HEX.GREY,
  },
];
export const roleMenu: RoleMenuProps[] = [
  {
    label: ROLE_NAMES.OWNER,
    value: ROLE_ZUIDS.OWNER,
  },
  {
    label: ROLE_NAMES.STAFF,
    value: ROLE_ZUIDS.STAFF,
  },
  {
    label: ROLE_NAMES.ADMIN,
    value: ROLE_ZUIDS.ADMIN,
  },
  {
    label: ROLE_NAMES.DEVELOPER,
    value: ROLE_ZUIDS.DEVELOPER,
  },
  {
    label: ROLE_NAMES.PUBLISHER,
    value: ROLE_ZUIDS.PUBLISHER,
  },
  {
    label: ROLE_NAMES.CONTRIBUTOR,
    value: ROLE_ZUIDS.CONTRIBUTOR,
  },
  {
    label: ROLE_NAMES.SEO,
    value: ROLE_ZUIDS.SEO,
  },
];
// Owner, Staff, or Admin
export const AuthorizedRoles: Array<RoleNameTypes> = [
  ROLE_NAMES.OWNER,
  ROLE_NAMES.STAFF,
  ROLE_NAMES.ADMIN,
];

export const getHexValue = (color: ColorNameTypes) => {
  const nColor = color
    .toUpperCase()
    .replace(" ", "_") as keyof typeof COLOR_HEX;
  return COLOR_HEX[nColor];
};

export const getRoleInfo = (zuids: string) => {
  const zuidList = zuids.split(",");
  const val = roleMenu.filter((item: RoleMenuProps, index: number) =>
    zuidList.includes(item?.value.trim())
  );

  return val;
};
