import { FC, useState } from "react";
import { Menu } from "@mui/material";

import { NormalMenu } from "./views/NormalMenu";
import { InstancesListMenu } from "./views/InstancesListMenu";
import { GlobalDomainsMenu } from "../../../GlobalDomainsMenu";

export type View = "normal" | "instances" | "domains";
interface DropdownMenuProps {
  anchorEl: HTMLElement;
  onClose: () => void;
  faviconURL: string;
}
export const DropdownMenu: FC<DropdownMenuProps> = ({
  anchorEl,
  onClose,
  faviconURL,
}) => {
  const [view, setView] = useState<View>("normal");

  return (
    <Menu
      open
      anchorEl={anchorEl}
      onClose={onClose}
      PaperProps={{
        sx: {
          pt: 0,
          mt: 1.25,
          width: 340,
          height: 555,
          borderRadius: 1,
        },
      }}
      MenuListProps={{
        sx: {
          p: 0,
        },
      }}
    >
      {view === "normal" && (
        <NormalMenu
          faviconURL={faviconURL}
          onChangeView={(view) => setView(view)}
          onCloseDropdownMenu={onClose}
        />
      )}
      {view === "instances" && (
        <InstancesListMenu onChangeView={(view) => setView(view)} />
      )}
      {view === "domains" && (
        <GlobalDomainsMenu
          onChangeView={(view) => setView(view as View)}
          onCloseDropdownMenu={onClose}
        />
      )}
    </Menu>
  );
};
