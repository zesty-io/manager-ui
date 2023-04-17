import {
  InfoRounded,
  LockRounded,
  DataObjectRounded,
  GridViewRounded,
  MenuBookRounded,
  SupportAgentRounded,
  LogoutRounded,
  SvgIconComponent,
} from "@mui/icons-material";

import instanceZUID from "../../../utility/instanceZUID";

export type ClickAction = [
  "openUrl" | "openView" | "openEmail" | "logOut",
  string
];
interface MenuItem {
  icon: SvgIconComponent;
  text: string;
  action: ClickAction;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: InfoRounded,
    text: "Your Profile",
    action: ["openUrl", "https://www.zesty.io/profile/"],
  },
  {
    icon: LockRounded,
    text: "Change Password",
    action: ["openUrl", "https://www.zesty.io/profile/security/"],
  },
  {
    icon: DataObjectRounded,
    text: "Preferences",
    action: ["openUrl", "https://www.zesty.io/profile/preferences/"],
  },
  {
    icon: GridViewRounded,
    text: "View All Instances",
    action: ["openUrl", "https://www.zesty.io/instances/"],
  },
  {
    icon: MenuBookRounded,
    text: "Read Docs",
    action: ["openView", "docs"],
  },
  {
    icon: SupportAgentRounded,
    text: "Get Help",
    action: [
      "openUrl",
      `https://www.zesty.io/instances/${instanceZUID}/support`,
    ],
  },
  {
    icon: LogoutRounded,
    text: "Log Out",
    action: ["logOut", ""],
  },
];
