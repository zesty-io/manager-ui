import { useState, FC, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import {
  Box,
  ThemeProvider,
  IconButton,
  Avatar,
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
import InviteMembersModal from "../InviteMembersModal";
import { User } from "../../services/types";
import { useGetInstanceQuery } from "../../services/accounts";
import { AppState } from "../../store/types";
import { InstanceMenu } from "./components/InstanceMenu";
import { actions } from "../../store/ui";
import { OnboardingCall } from "./components/OnboardingCall";
import { GlobalAccountMenu } from "../GlobalAccountMenu";
import { GlobalDocsMenu } from "../GlobalDocsMenu";

interface GlobalSidebarProps {
  openNav: boolean;
  onClick: () => void;
}
const GlobalSidebar: FC<GlobalSidebarProps> = ({ onClick, openNav }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const user: User = useSelector((state: AppState) => state.user);
  const { data: instance } = useGetInstanceQuery();
  const accountMenuBtn = useRef<HTMLDivElement | null>(null);
  const [showDocsMenu, setShowDocsMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const ui = useSelector((state: AppState) => state.ui);
  const dispatch = useDispatch();
  const is15DaysFromCreation =
    instance?.createdAt &&
    moment().diff(moment(instance?.createdAt), "days") <= 15;

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
            data-cy="CollapseGlobalSideBar"
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
              zIndex: (theme) => theme.zIndex.appBar,

              "&:hover": {
                backgroundColor: "grey.900",

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
                  color: "grey.500",
                }}
              />
            ) : (
              <KeyboardDoubleArrowRightIcon
                fontSize="small"
                sx={{ color: "grey.500" }}
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
                  title="View source code commit"
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
              px={2.5}
              gap={openNav ? 0 : 1}
              sx={{
                borderColor: "grey.800",
              }}
            >
              <Stack
                ref={accountMenuBtn}
                data-cy="globalAccountAvatar"
                direction="row"
                alignItems="center"
                width={openNav ? 49 : 32}
                onClick={() => {
                  setShowAccountMenu(true);
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
                  data-cy="InviteUser"
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
                  data-cy="ReadDocs"
                  onClick={() => {
                    setShowDocsMenu(true);
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

              <GlobalAccountMenu
                open={showAccountMenu}
                anchorEl={accountMenuBtn?.current}
                onClose={() => {
                  setShowAccountMenu(false);
                }}
                onShowDocsMenu={() => {
                  setShowAccountMenu(false);
                  setShowDocsMenu(true);
                }}
              />

              <GlobalDocsMenu
                open={showDocsMenu}
                anchorEl={accountMenuBtn?.current}
                onClose={() => {
                  setShowDocsMenu(false);
                }}
              />
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
