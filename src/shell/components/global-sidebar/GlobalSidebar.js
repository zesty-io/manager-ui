import { useState } from "react";
import { connect } from "react-redux";
import styles from "./GlobalSidebar.less";

import { Box, ThemeProvider, IconButton } from "@mui/material";
import GlobalMenu from "shell/components/global-menu";
import GlobalCustomApps from "shell/components/global-custom-apps";
import GlobalActions from "shell/components/global-actions";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { theme } from "@zesty-io/material";
import InviteMembersModal from "../InviteMembersModal";

const globalSideBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
};

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
  };
})(function GlobalSidebar(props) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <aside className={styles.GlobalSidebar} style={globalSideBarThemeStyles}>
        <div>
          <Box sx={{ px: 2.5, pb: 0, pt: 2.5 }}>
            {props.openNav ? (
              <Box
                component="img"
                data-src={fullZestyLogo}
                src={fullZestyLogo}
                sx={{
                  width: "84.17px",
                  height: "24px",
                }}
              />
            ) : (
              <Box
                component="img"
                data-src={zestyLogo}
                src={zestyLogo}
                sx={{
                  width: "24px",
                  height: "24px",
                }}
              />
            )}
          </Box>
          <IconButton
            onClick={props.onClick}
            sx={{
              borderColor: "grey.600",
              borderStyle: "solid",
              borderWidth: "1px",
              backgroundColor: "grey.900",
              float: "right",
              mr: -1.5,
              zIndex: 50,
              width: "24px",
              height: "24px",

              "&:hover": {
                backgroundColor: "primary.main",
                borderColor: "common.white",

                ".MuiSvgIcon-root": {
                  color: "common.white",
                },
              },
            }}
          >
            {props.openNav ? (
              <KeyboardDoubleArrowLeftIcon
                fontSize="small"
                sx={{
                  color: "grey.600",
                }}
              />
            ) : (
              <KeyboardDoubleArrowRightIcon
                fontSize="small"
                sx={{ color: "grey.600" }}
              />
            )}
          </IconButton>
          <GlobalMenu openNav={props.ui.openNav} />
          <GlobalCustomApps openNav={props.ui.openNav} />
          {/* <GlobalActions hash={props.instance.randomHashID} /> */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              display: "flex",
              width: "100%",
              overflow: "hidden",
              borderTopColor: "grey.800",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              p: 2,
            }}
          >
            <Box></Box>
            <IconButton
              onClick={() => setShowInviteModal(true)}
              sx={{
                backgroundColor: "grey.800",
                borderRadius: "4px",
                height: "26px",
                width: "32px",
              }}
            >
              <GroupAddIcon fontSize="small" sx={{ color: "grey.500" }} />
            </IconButton>
          </Box>
        </div>
        {showInviteModal && (
          <InviteMembersModal onClose={() => setShowInviteModal(false)} />
        )}
      </aside>
    </ThemeProvider>
  );
});