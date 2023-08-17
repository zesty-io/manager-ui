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
  Tooltip,
  ListItem,
  SvgIcon,
} from "@mui/material";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { theme } from "@zesty-io/material";

import GlobalMenu from "../global-menu";
import Favicon from "../favicon";
import zestyLogo from "../../../../public/images/zestyLogo.svg";
import zestyLogoOnly from "../../../../public/images/zestyLogoOnly.svg";
import zestyLogoOnlyGrey from "../../../../public/images/zestyLogoOnlyGrey.svg";
import githubLogoSmall from "../../../../public/images/githubLogoSmall.svg";
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
            borderRight: "1px solid",
            borderColor: "grey.800",
          }}
        >
          <ListItem
            sx={{
              height: 36,
              px: 1.5,
              py: 0.75,
              mt: 0.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Tooltip
              title={openNav ? "Collapse Sidebar" : "Expand Sidebar"}
              placement="right-start"
              enterDelay={1000}
              enterNextDelay={1000}
            >
              <MenuRoundedIcon
                data-cy="CollapseGlobalSideBar"
                onClick={onClick}
                sx={{ color: "grey.400", cursor: "pointer" }}
              />
            </Tooltip>
            {openNav && (
              <Box
                component="img"
                src={zestyLogoOnlyGrey}
                alt="Zesty Logo"
                width={20}
                height={20}
              />
            )}
          </ListItem>

          <InstanceMenu openNav={openNav} />
          <GlobalMenu />
          {is15DaysFromCreation && openNav && <OnboardingCall />}

          {/* Bottom bar */}
          <Box position="absolute" bottom={0} left={0} right={0}>
            <Stack
              direction={openNav ? "row" : "column"}
              alignItems="center"
              justifyContent="space-between"
              height={openNav ? 24 : "inherit"}
              px={1.5}
              mb={openNav ? 1.5 : 0}
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
              <Stack direction="row" gap={0.5} alignItems="end">
                {openNav && (
                  <Box
                    component="img"
                    src={githubLogoSmall}
                    alt="Github Logo"
                    width={12}
                    height={12}
                  />
                )}
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
            </Stack>

            <Stack
              width="inherit"
              justifyContent="space-between"
              overflow="hidden"
              borderTop={openNav ? "1px solid" : "none"}
              alignItems="center"
              flexDirection={openNav ? "row" : "column-reverse"}
              py={1.25}
              px={openNav ? 1.5 : 1}
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
