import { useState, useEffect, useMemo, FC } from "react";
import { useSelector, useDispatch } from "react-redux";
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
  Link,
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
import { actions } from "../../store/ui";
import { OnboardingCall } from "./components/OnboardingCall";

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
  const dispatch = useDispatch();

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
          <InstanceMenu openNav={openNav} />

          {/* Sidebar handle */}
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

          {/* Bottom bar */}
          <Box position="absolute" bottom={0} left={0} right={0}>
            {instance?.createdAt &&
            moment().diff(moment(instance?.createdAt), "days") <= 15 &&
            ui.openNav ? (
              <OnboardingCall />
            ) : (
              <Stack
                direction="row"
                alignItems="center"
                height={24}
                px={2.5}
                mb={1.25}
                gap={1.5}
              >
                <img
                  src={fullZestyLogo}
                  alt="Full Zesty Logo"
                  width={84}
                  height={24}
                />
                <Box>
                  <Link
                    fontFamily="Roboto Mono"
                    fontSize={10}
                    letterSpacing={0.15}
                    lineHeight={10}
                    color="grey.500"
                    underline="none"
                    // @ts-ignore
                    href={`https://github.com/zesty-io/manager-ui/commit/${CONFIG?.build?.data?.gitCommit}`}
                  >
                    #
                    {
                      //@ts-ignore
                      CONFIG?.build?.data?.gitCommit
                    }
                  </Link>
                </Box>
              </Stack>
            )}

            <Box
              sx={{
                display: "flex",
                width: "inherit",
                justifyContent: "space-between",
                overflow: "hidden",
                borderTopColor: "grey.800",
                borderTopWidth: "1px",
                borderTopStyle: "solid",
                alignItems: "center",
                flexDirection: openNav ? "row" : "column-reverse",
                py: 1.25,
                px: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                width={49}
                onClick={() => {
                  setShowDocsMenu(false);
                  setShowInstanceFlyoutMenu(true);
                }}
                fontSize={16}
                sx={{
                  "&:hover": {
                    cursor: "pointer",
                  },
                }}
              >
                <Avatar
                  alt={`${user.firstName} ${user.lastName} Avatar`}
                  src={`https://www.gravatar.com/avatar/${user.emailHash}.jpg?&s=40`}
                  sx={{
                    // ml: openNav ? "-12px" : "0px",
                    height: 32,
                    width: 32,
                  }}
                />
                <ArrowDropDownIcon
                  fontSize="inherit"
                  sx={{
                    color: "grey.500",
                    // display: openNav ? "block" : "none",
                  }}
                />
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: openNav ? "row" : "column",
                  // pr: openNav ? 2 : 0,
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
              {/* {showInstanceFlyoutMenu && (
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
              )} */}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
      {ui.isUpdateFaviconModalOpen && (
        <Favicon
          // @ts-ignore not a typescript file
          onCloseFaviconModal={() =>
            dispatch(actions.toggleUpdateFaviconModal(false))
          }
        />
      )}
    </>
  );
};

export default GlobalSidebar;
