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
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import zestyLogoOnly from "../../../../public/images/zestyLogoOnly.svg";
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
import { GlobalAccountMenu } from "../GlobalAccountMenu";

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
  const [accountMenuAnchorEl, setAccountMenuAnchorEl] =
    useState<HTMLElement | null>(null);
  const [showDocsMenu, setShowDocsMenu] = useState(false);
  const ui = useSelector((state: AppState) => state.ui);
  const dispatch = useDispatch();
  const is15DaysFromCreation =
    instance?.createdAt &&
    moment().diff(moment(instance?.createdAt), "days") <= 15;

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
            {is15DaysFromCreation && openNav && <OnboardingCall />}

            {!is15DaysFromCreation && (
              <Stack
                direction={openNav ? "row" : "column"}
                alignItems="center"
                height={openNav ? 24 : "inherit"}
                px={2.5}
                mb={openNav ? 1.25 : 0}
                pt={openNav ? 0 : 1.5}
                gap={1.5}
                borderTop={openNav ? "none" : "1px solid"}
                sx={{
                  borderColor: "grey.800",
                }}
              >
                <img
                  src={openNav ? zestyLogo : zestyLogoOnly}
                  alt="Zesty Logo"
                  width={openNav ? 84 : 20}
                  height={openNav ? 24 : 20}
                />
                <Link
                  fontFamily="Roboto Mono"
                  fontSize={10}
                  letterSpacing={0.15}
                  lineHeight="10px"
                  color="grey.500"
                  underline="none"
                  // @ts-ignore
                  href={`https://github.com/zesty-io/manager-ui/commit/${CONFIG?.build?.data?.gitCommit}`}
                  target="_blank"
                  rel="noopener"
                  width={openNav ? "inherit" : 32}
                  textAlign="center"
                  sx={{
                    wordWrap: "break-word",
                  }}
                >
                  #
                  {
                    //@ts-ignore
                    CONFIG?.build?.data?.gitCommit
                  }
                </Link>
              </Stack>
            )}

            <Stack
              width="inherit"
              justifyContent="space-between"
              overflow="hidden"
              borderTop={openNav ? "1px solid" : "none"}
              alignItems="center"
              flexDirection={openNav ? "row" : "column-reverse"}
              py={1.25}
              px={2}
              gap={openNav ? 0 : 1}
              sx={{
                borderColor: "grey.800",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                width={openNav ? 49 : 32}
                onClick={(evt: React.MouseEvent<HTMLDivElement>) => {
                  // setShowDocsMenu(false);
                  // setShowAccountMenu(true);
                  setAccountMenuAnchorEl(evt.currentTarget);
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
                    height: 32,
                    width: 32,
                  }}
                />
                {openNav && (
                  <ArrowDropDownIcon
                    fontSize="inherit"
                    sx={{
                      color: "grey.500",
                    }}
                  />
                )}
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: openNav ? "row" : "column",
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
                    // setShowDocsMenu(true);
                    // setShowAccountMenu(true);
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
              {Boolean(accountMenuAnchorEl) && (
                <GlobalAccountMenu
                  anchorEl={accountMenuAnchorEl}
                  onClose={() => setAccountMenuAnchorEl(null)}
                />
              )}
            </Stack>
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
