export type ColorMenu = {
  label: string;
  value: string;
};

export type RoleMenu = {
  label: string;
  value: string;
};

export const colorMenu: ColorMenu[] = [
  { label: "Blue", value: "#0BA5EC" },
  { label: "Deep Purple", value: "#4E5BA6" },
  { label: "Green", value: "#12b76a" },
  { label: "Orange", value: "#FF5C08" },
  { label: "Pink", value: "#EE46BC" },
  { label: "Purple", value: "#7A5AF8" },
  { label: "Red", value: "#F04438" },
  { label: "Rose", value: "#F63D68" },
  { label: "Yellow", value: "#F79009" },
  { label: "Grey", value: "#667085" },
];

const ADMIN_ZUID = "31-71cfc74-4dm13";
const OWNER_ZUID = "31-71cfc74-0wn3r";

export const AUTHORIZED_ROLES: string[] = [ADMIN_ZUID, OWNER_ZUID];

export type AuthorizedRole = typeof AUTHORIZED_ROLES[number];
