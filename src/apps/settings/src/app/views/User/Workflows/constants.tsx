export type ColorMenu = {
  label: string;
  value: string;
};

export type RoleMenu = {
  label: string;
  value: string;
};

export const colorMenu: ColorMenu[] = [
  { label: "settings.colorBlue", value: "#0BA5EC" },
  { label: "settings.colorDeepPurple", value: "#4E5BA6" },
  { label: "settings.colorGreen", value: "#12b76a" },
  { label: "settings.colorOrange", value: "#FF5C08" },
  { label: "settings.colorPink", value: "#EE46BC" },
  { label: "settings.colorPurple", value: "#7A5AF8" },
  { label: "settings.colorRed", value: "#F04438" },
  { label: "settings.colorRose", value: "#F63D68" },
  { label: "settings.colorYellow", value: "#F79009" },
  { label: "settings.colorGrey", value: "#667085" },
];

const ADMIN_ZUID = "31-71cfc74-4dm13";
const OWNER_ZUID = "31-71cfc74-0wn3r";

export const AUTHORIZED_ROLES: string[] = [ADMIN_ZUID, OWNER_ZUID];

export type AuthorizedRole = (typeof AUTHORIZED_ROLES)[number];
