import { FC, useState } from "react";
import { Menu } from "@mui/material";

import { NormalMenu } from "./views/NormalMenu";
import { InstancesMenu } from "./views/InstancesMenu";
import { DomainsMenu } from "./views/DomainsMenu";

export type View = "normal" | "instances" | "domains";
interface DropdownMenuProps {
  anchorEl: HTMLElement;
  onClose: () => void;
  faviconURL: string;
  instanceName: string;
}
export const DropdownMenu: FC<DropdownMenuProps> = ({
  anchorEl,
  onClose,
  faviconURL,
  instanceName,
}) => {
  const [view, setView] = useState<View>("normal");

  return (
    <Menu
      open={Boolean(anchorEl)}
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
          instanceName={instanceName}
          onChangeView={(view) => setView(view)}
        />
      )}
      {view === "instances" && <InstancesMenu />}
      {view === "domains" && <DomainsMenu />}
    </Menu>
  );
};
