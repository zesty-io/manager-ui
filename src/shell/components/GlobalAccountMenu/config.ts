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
  // Translation key resolved at render time via t(). t() can't run at module
  // level, so the label lives as a key here and is translated in the component.
  textKey: string;
  // Stable, locale-independent test selector. Kept separate from the label so
  // data-cy never changes when the UI language changes.
  dataCy: string;
  action: ClickAction;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    icon: InfoRounded,
    textKey: "shell.accountYourProfile",
    dataCy: "YourProfile",
    action: ["openUrl", "https://www.zesty.io/profile/"],
  },
  {
    icon: LockRounded,
    textKey: "shell.accountChangePassword",
    dataCy: "ChangePassword",
    action: ["openUrl", "https://www.zesty.io/profile/security/"],
  },
  {
    icon: DataObjectRounded,
    textKey: "shell.accountPreferences",
    dataCy: "Preferences",
    action: ["openUrl", "https://www.zesty.io/profile/preferences/"],
  },
  {
    icon: GridViewRounded,
    textKey: "shell.accountViewAllInstances",
    dataCy: "ViewAll Instances",
    action: ["openUrl", "https://www.zesty.io/instances/"],
  },
  {
    icon: MenuBookRounded,
    textKey: "shell.accountReadDocs",
    dataCy: "ReadDocs",
    action: ["openView", "docs"],
  },
  {
    icon: SupportAgentRounded,
    textKey: "shell.accountGetHelp",
    dataCy: "GetHelp",
    action: [
      "openUrl",
      `https://www.zesty.io/instances/${instanceZUID}/support`,
    ],
  },
  {
    icon: LogoutRounded,
    textKey: "shell.accountLogOut",
    dataCy: "LogOut",
    action: ["logOut", ""],
  },
];
