import { FC, useState } from "react";
import { Menu } from "@mui/material";

import { AccountMenu } from "./views/AccountMenu";
import { DocsMenu } from "./views/DocsMenu";

export type View = "account" | "docs";
interface GlobalAccountMenuProps {
  anchorEl: HTMLElement;
  onClose: () => void;
  view?: View;
}
export const GlobalAccountMenu: FC<GlobalAccountMenuProps> = ({
  anchorEl,
  onClose,
  view = "account",
}) => {
  const [modalView, setModalView] = useState<View>(view);

  return (
    <Menu
      open
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        sx: {
          height: 395,
          width: 340,
        },
      }}
      MenuListProps={{
        sx: {
          pt: 0,
        },
      }}
      anchorOrigin={{
        vertical: -12,
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      {modalView === "account" && (
        <AccountMenu
          onChangeView={(view) => setModalView(view)}
          onCloseMenu={onClose}
        />
      )}

      {modalView === "docs" && <DocsMenu />}
    </Menu>
  );
};
