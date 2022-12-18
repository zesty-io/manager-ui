import { useState, useEffect } from "react";
import { useDispatch, connect } from "react-redux";
import styles from "./GlobalSidebar.less";
import { useSelector } from "react-redux";
import { fetchHeadTags } from "shell/store/headTags";

import {
  Box,
  ThemeProvider,
  IconButton,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import GlobalMenu from "shell/components/global-menu";
import GlobalCustomApps from "shell/components/global-custom-apps";
import GlobalActions from "shell/components/global-actions";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { theme } from "@zesty-io/material";

import InviteMembersModal from "../InviteMembersModal";

const globalSideBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
};

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
    headTags: state.headTags,
  };
})(function GlobalSidebar(props) {
  const dispatch = useDispatch();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const user = useSelector((state) => state.user);
  const [faviconURL, setFaviconURL] = useState("");

  useEffect(() => {
    dispatch(fetchHeadTags());
  }, []);

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
              justifyContent: "space-between",
              width: "100%",
              overflow: "hidden",
              borderTopColor: "grey.800",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              p: 2,
            }}
          >
            <Box sx={{ display: "flex", flex: 1 }}>
              <AvatarGroup
                total={2}
                sx={{
                  "& .MuiAvatar-root": {
                    width: "32px",
                    height: "32px",
                    border: "none",
                  },
                }}
              >
                <Avatar size={20} src={faviconURL} />
                <Avatar
                  sx={{ ml: -5 }}
                  alt={`${user.firstName} ${user.lastName} Avatar`}
                  src={`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=40`}
                />
              </AvatarGroup>
              <ArrowDropDownIcon
                fontSize="small"
                sx={{ color: "grey.500", mt: 0.5 }}
              />
            </Box>
            <Box sx={{ display: "flex", flex: 1 }}>
              <IconButton
                onClick={() => setShowInviteModal(true)}
                sx={{
                  backgroundColor: "grey.800",
                  borderRadius: "4px",
                }}
              >
                <GroupAddIcon fontSize="small" sx={{ color: "grey.500" }} />
              </IconButton>
            </Box>
          </Box>
        </div>
        {showInviteModal && (
          <InviteMembersModal onClose={() => setShowInviteModal(false)} />
        )}
      </aside>
    </ThemeProvider>
  );
});
