import React, { useState } from "react";
import { IconButton, Menu } from "@mui/material";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";

import { GlobalDomainsMenu } from "../GlobalDomainsMenu";

export const DomainSwitcher = () => {
  const [anchorRef, setAnchorRef] = useState<HTMLButtonElement | null>(null);

  const isMenuOpen = Boolean(anchorRef);

  return (
    <>
      <IconButton
        size="small"
        onClick={(evt: React.MouseEvent<HTMLButtonElement>) =>
          setAnchorRef(evt.currentTarget)
        }
        data-cy="DomainSwitcher"
      >
        <LanguageRoundedIcon fontSize="inherit" />
      </IconButton>
      <Menu
        open={isMenuOpen}
        anchorEl={anchorRef}
        onClose={() => setAnchorRef(null)}
        PaperProps={{
          sx: {
            p: 0,
            mt: 0.75,
            width: 340,
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <GlobalDomainsMenu
          onCloseDropdownMenu={() => setAnchorRef(null)}
          withBackButton={false}
        />
      </Menu>
    </>
  );
};
