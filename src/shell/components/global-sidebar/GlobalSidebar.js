import { useState, useEffect } from "react";
import { useDispatch, connect } from "react-redux";
import styles from "./GlobalSidebar.less";
import { useSelector } from "react-redux";
import { fetchHeadTags } from "shell/store/headTags";
import moment from "moment";

import {
  Box,
  ThemeProvider,
  IconButton,
  Avatar,
  AvatarGroup,
  Button,
  Dialog,
  Typography,
} from "@mui/material";
import GlobalMenu from "shell/components/global-menu";
import GlobalCustomApps from "shell/components/global-custom-apps";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import Favicon from "../favicon";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import salesAvatar from "../../../../public/images/salesAvatar.png";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { theme } from "@zesty-io/material";

import InstanceFlyoutMenuModal from "../InstanceFlyoutMenuModal";
import InviteMembersModal from "../InviteMembersModal";

const globalSideBarThemeStyles = {
  backgroundColor: theme.palette.grey[900],
};

const OnboardingCallSection = () => {
  const [showMeetModal, setShowMeetModal] = useState(false);

  return (
    <>
      <Box sx={{ p: 2 }}>
        <Avatar
          src={salesAvatar}
          sx={{
            width: "32px",
            height: "32px",
          }}
        />
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="h6" sx={{ color: "common.white" }}>
            Schedule an onboarding call
          </Typography>
          <Typography variant="body3" sx={{ mt: 0.5, color: "grey.400" }}>
            Our support team will set <br /> up you in just 20 minutes.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{ mt: 1 }}
          onClick={() => setShowMeetModal(true)}
        >
          Schedule a call
        </Button>
      </Box>
      <Dialog open={showMeetModal} onClose={() => setShowMeetModal(false)}>
        <iframe
          width="364"
          height="800"
          src="https://zesty.zohobookings.com/portal-embed#/customer/3973976000000039370"
        ></iframe>
      </Dialog>
    </>
  );
};

export default connect((state) => {
  return {
    ui: state.ui,
    instance: state.instance,
    headTags: state.headTags,
  };
})(function GlobalSidebar(props) {
  const dispatch = useDispatch();
  const [showFaviconModal, setShowFaviconModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const user = useSelector((state) => state.user);
  const instances = useSelector((state) => state.instances);
  const [faviconURL, setFaviconURL] = useState("");
  const [instanceCreationDate, setInstanceCreationDate] = useState("");
  const [showInstanceFlyoutMenu, setShowInstanceFlyoutMenu] = useState(false);

  useEffect(() => {
    dispatch(fetchHeadTags());
  }, []);

  const getFavoriteInstances = () => {
    let data = [];
    JSON.parse(user?.prefs).favorite_sites.forEach((fav) => {
      const res = instances.filter((instance) => instance.ZUID === fav);
      data = res;
    });
    return data;
  };

  // @Note: Need to refactor this to rtk query
  useEffect(() => {
    const tag = Object.values(props?.headTags).find((tag) =>
      tag?.attributes.find(
        (attr) => attr?.key === "sizes" && attr?.value === "196x196"
      )
    );
    if (tag) {
      const attr = tag.attributes.find((attr) => attr.key === "href");
      setFaviconURL(attr.value);
      setInstanceCreationDate(tag.createdAt);
    }
  }, [props.headTags]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <aside
          className={styles.GlobalSidebar}
          style={globalSideBarThemeStyles}
        >
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
          {moment().diff(moment(instanceCreationDate), "days") <= 15 &&
            props.ui.openNav && <OnboardingCallSection />}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              display: "flex",
              width: "inherit",
              justifyContent: "space-between",
              overflow: "hidden",
              borderTopColor: "grey.800",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              alignItems: "center",
              flexDirection: props.openNav ? "row" : "column-reverse",
              py: 1,
            }}
          >
            <Box
              sx={{
                px: 2,
                display: "flex",
                cursor: "pointer",
                mt: !props.openNav && 1,
              }}
              onClick={() => setShowInstanceFlyoutMenu(true)}
            >
              <AvatarGroup
                total={2}
                sx={{
                  flexDirection: props.openNav ? "row-reverse" : "column",
                  "& .MuiAvatar-root": {
                    width: "32px",
                    height: "32px",
                    border: "none",
                  },
                }}
              >
                <Avatar
                  src={faviconURL}
                  style={{
                    marginTop: props.openNav ? "0" : "-8px",
                  }}
                />
                <Avatar
                  style={{
                    marginLeft: props.openNav ? "-8px" : "0px",
                  }}
                  alt={`${user.firstName} ${user.lastName} Avatar`}
                  src={`https://www.gravatar.com/avatar/${user.faviconURL}?d=mm&s=40`}
                />
              </AvatarGroup>
              <ArrowDropDownIcon
                fontSize="small"
                sx={{
                  color: "grey.500",
                  mt: 0.5,
                  display: props.openNav ? "block" : "none",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                px: 2,
              }}
            >
              <IconButton
                onClick={() => setShowInviteModal(true)}
                sx={{
                  backgroundColor: "grey.800",
                  height: "26px",
                  borderRadius: "4px",
                }}
              >
                <GroupAddIcon fontSize="small" sx={{ color: "grey.500" }} />
              </IconButton>
            </Box>
            {showInviteModal && (
              <InviteMembersModal onClose={() => setShowInviteModal(false)} />
            )}
            {showInstanceFlyoutMenu && (
              <InstanceFlyoutMenuModal
                instanceFaviconUrl={faviconURL}
                instanceName={props.instance?.name}
                instanceZUID={props.instance?.ZUID}
                userFaviconUrl={user.faviconURL}
                userFullname={`${user.firstName} ${user.lastName}`}
                favoriteInstances={getFavoriteInstances()}
                onSetShowFaviconModal={() => {
                  setShowFaviconModal(!showFaviconModal);
                  setShowInstanceFlyoutMenu(false);
                }}
                onClose={() => setShowInstanceFlyoutMenu(false)}
              />
            )}
          </Box>
        </aside>
      </ThemeProvider>
      {showFaviconModal && (
        <Favicon onCloseFaviconModal={() => setShowFaviconModal(false)} />
      )}
    </>
  );
});
