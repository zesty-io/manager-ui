import { useState, useEffect, useMemo, FC } from "react";
import { useSelector } from "react-redux";
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
  Stack,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { theme } from "@zesty-io/material";

import GlobalMenu from "../global-menu";
import Favicon from "../favicon";
import fullZestyLogo from "../../../../public/images/fullZestyLogo.svg";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import salesAvatar from "../../../../public/images/salesAvatar.png";
import InstanceFlyoutMenuModal from "../InstanceFlyoutMenuModal";
import InviteMembersModal from "../InviteMembersModal";
import { User, Instance } from "../../services/types";
import {
  useGetInstancesQuery,
  useGetInstanceQuery,
} from "../../services/accounts";
import { AppState } from "../../store/types";
import instanceZUID from "../../../utility/instanceZUID";
import { InstanceMenu } from "./components/InstanceMenu";

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
          <Typography
            // @ts-ignore
            variant="body3"
            sx={{ mt: 0.5, color: "grey.400" }}
          >
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

interface GlobalSidebarProps {
  openNav: boolean;
  onClick: () => void;
}
const GlobalSidebar: FC<GlobalSidebarProps> = ({ onClick, openNav }) => {
  const [showFaviconModal, setShowFaviconModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const user: User = useSelector((state: AppState) => state.user);
  const { data: instances } = useGetInstancesQuery();
  const { data: instance } = useGetInstanceQuery();
  const [faviconURL, setFaviconURL] = useState("");
  const [showInstanceFlyoutMenu, setShowInstanceFlyoutMenu] = useState(false);
  const [showDocsMenu, setShowDocsMenu] = useState(false);
  const ui = useSelector((state: AppState) => state.ui);

  const favoriteSites = useMemo(() => {
    if (user && instances?.length) {
      let data: Instance[] = [];
      if (user?.prefs) {
        const favorite_sites: string[] = JSON.parse(
          user?.prefs
        )?.favorite_sites;

        favorite_sites?.forEach((fav) => {
          const res = instances?.filter((instance) => instance.ZUID === fav);
          data.push(...res);
        });
      }
      return data;
    }

    return [];
  }, [user, instances]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <Box
          component="aside"
          position="relative"
          boxSizing="border-box"
          sx={{
            backgroundColor: "grey.900",
          }}
        >
          <InstanceMenu
            openNav={openNav}
            onUpdateFavicon={() => setShowFaviconModal(!showFaviconModal)}
          />

          <IconButton
            onClick={onClick}
            sx={{
              borderColor: "grey.600",
              borderStyle: "solid",
              borderWidth: "1px",
              backgroundColor: "grey.900",

              width: "24px",
              height: "24px",

              position: "absolute",
              top: "32px",
              right: "-12px",
              zIndex: (theme) => theme.zIndex.drawer,

              "&:hover": {
                backgroundColor: "primary.main",
                borderColor: "common.white",

                ".MuiSvgIcon-root": {
                  color: "common.white",
                },
              },
            }}
          >
            {openNav ? (
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
          <GlobalMenu />
          {instance?.createdAt &&
            moment().diff(moment(instance?.createdAt), "days") <= 15 &&
            ui.openNav && <OnboardingCallSection />}

          {/* Bottom bar */}
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
              flexDirection: openNav ? "row" : "column-reverse",
              py: "10px",
            }}
          >
            <Box
              sx={{
                px: 2,
                display: "flex",
                cursor: "pointer",
                mt: !openNav && 1,
              }}
              onClick={() => {
                setShowDocsMenu(false);
                setShowInstanceFlyoutMenu(true);
              }}
            >
              <AvatarGroup
                total={2}
                sx={{
                  flexDirection: openNav ? "row-reverse" : "column",
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
                    marginTop: openNav ? "0" : "-8px",
                  }}
                />
                <Avatar
                  style={{
                    marginLeft: openNav ? "-12px" : "0px",
                  }}
                  alt={`${user.firstName} ${user.lastName} Avatar`}
                  src={`https://www.gravatar.com/avatar/${user.emailHash}.jpg?&s=40`}
                />
              </AvatarGroup>
              <ArrowDropDownIcon
                fontSize="small"
                sx={{
                  color: "grey.500",
                  mt: 0.5,
                  display: openNav ? "block" : "none",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: openNav ? "row" : "column",
                pr: openNav ? 2 : 0,
                alignItems: "center",
              }}
            >
              <IconButton
                onClick={() => setShowInviteModal(true)}
                sx={{
                  backgroundColor: "grey.800",
                  height: "26px",
                  width: "32px",
                  borderRadius: "4px",
                  mr: openNav ? 1 : 0,
                }}
              >
                <GroupAddIcon fontSize="small" sx={{ color: "grey.500" }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  setShowDocsMenu(true);
                  setShowInstanceFlyoutMenu(true);
                }}
                sx={{
                  backgroundColor: "grey.800",
                  width: "32px",
                  mt: openNav ? 0 : 1,
                  height: "26px",
                  borderRadius: "4px",
                }}
              >
                <MenuBookIcon fontSize="small" sx={{ color: "grey.500" }} />
              </IconButton>
            </Box>
            {showInviteModal && (
              <InviteMembersModal onClose={() => setShowInviteModal(false)} />
            )}
            {showInstanceFlyoutMenu && (
              <InstanceFlyoutMenuModal
                instanceFaviconUrl={faviconURL}
                instanceName={instance?.name}
                instanceZUID={instance?.ZUID}
                userFaviconUrl={user.emailHash}
                userFullname={`${user.firstName} ${user.lastName}`}
                favoriteInstances={favoriteSites}
                showDocsMenu={showDocsMenu}
                onSetShowDocsMenu={(val) => setShowDocsMenu(val)}
                onSetShowFaviconModal={() => {
                  setShowFaviconModal(!showFaviconModal);
                  setShowInstanceFlyoutMenu(false);
                }}
                onClose={() => setShowInstanceFlyoutMenu(false)}
              />
            )}
          </Box>
        </Box>
      </ThemeProvider>
      {showFaviconModal && (
        <Favicon
          // @ts-ignore not a typescript file
          onCloseFaviconModal={() => setShowFaviconModal(false)}
        />
      )}
    </>
  );
};

export default GlobalSidebar;
