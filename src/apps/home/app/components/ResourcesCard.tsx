import {
  Box,
  Typography,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
} from "@mui/material";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import postmanIcon from "../../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../../public/images/graphQLIcon.svg";
import parsleyIcon from "../../../../../public/images/parsleyIcon.svg";
import starCheckIcon from "../../../../../public/images/starCheckIcon.svg";
import slackIcon from "../../../../../public/images/slackIcon.svg";
import youtubeIcon from "../../../../../public/images/youtubeIcon.svg";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import CollectionsBookmarkRoundedIcon from "@mui/icons-material/CollectionsBookmarkRounded";
import { useState } from "react";
import InviteMembersModal from "../../../../shell/components/InviteMembersModal";

interface Props {
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const ResourcesCard = ({ hideHeader, hideFooter }: Props) => {
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  const matureItems = (
    useSecondaryPlatformDocIcon: boolean,
    hideReleaseNotes: boolean
  ) => {
    return (
      <>
        <ListItemButton
          divider
          onClick={() =>
            handleNavigation("https://zesty.org/quick-start-guide")
          }
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <RocketLaunchRoundedIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Get Started"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        <ListItemButton
          divider
          onClick={() => handleNavigation("https://zesty.org/")}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            {useSecondaryPlatformDocIcon ? (
              <CollectionsBookmarkRoundedIcon color="info" />
            ) : (
              <MenuBookRoundedIcon color="info" />
            )}
          </ListItemIcon>
          <ListItemText
            primary="Platform Docs"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        <ListItemButton
          divider
          onClick={() => handleNavigation("https://instances-api.zesty.org/")}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <img src={postmanIcon} />
          </ListItemIcon>
          <ListItemText
            primary="Instance API Docs"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        <ListItemButton
          divider
          onClick={() =>
            handleNavigation("https://github.com/zesty-io/graphql-zesty")
          }
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <img src={graphQLIcon} />
          </ListItemIcon>
          <ListItemText
            primary="GraphQL Docs"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        <ListItemButton
          divider
          onClick={() => handleNavigation("https://parsley.zesty.io/")}
        >
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <img width="24px" height="24px" src={parsleyIcon} />
          </ListItemIcon>
          <ListItemText
            primary="Parsley Docs"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        {!hideReleaseNotes && (
          <ListItemButton
            divider
            onClick={() =>
              handleNavigation(
                "https://www.zesty.io/mindshare/product-announcements"
              )
            }
          >
            <ListItemIcon sx={{ minWidth: "36px" }}>
              <img src={starCheckIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Release Notes"
              primaryTypographyProps={{
                variant: "body2",
              }}
            />
          </ListItemButton>
        )}
      </>
    );
  };

  return (
    <>
      {!hideHeader && (
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Resources
          </Typography>
          <Typography
            variant="body3"
            color="text.secondary"
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            Everything you need to get the best out of Zesty.
          </Typography>
        </Box>
      )}
      {matureItems(false, false)}
      {!hideFooter && (
        <Box display="flex" justifyContent="space-between" padding={2}>
          <Typography variant="body3" color="text.secondary">
            JOIN OUR COMMUNITY
          </Typography>
          <Box
            display="flex"
            gap={2}
            sx={{
              img: {
                cursor: "pointer",
              },
            }}
          >
            <img
              src={slackIcon}
              onClick={() =>
                handleNavigation(
                  "https://join.slack.com/t/zestyiodevs/shared_invite/zt-1jv3ct6k4-uuDM5ZNLy3NgK2FCzK~xuw"
                )
              }
            />
            <img
              src={youtubeIcon}
              onClick={() =>
                handleNavigation("https://www.youtube.com/c/Zestyio/videos")
              }
            />
            <NewspaperRoundedIcon
              sx={{ cursor: "pointer" }}
              color="primary"
              fontSize="small"
              onClick={() =>
                handleNavigation("https://www.zesty.io/mindshare/")
              }
            />
          </Box>
        </Box>
      )}
      <Dialog open={showMeetModal} onClose={() => setShowMeetModal(false)}>
        <iframe
          width="364"
          height="800"
          src="https://zesty.zohobookings.com/portal-embed#/customer/3973976000000039370"
        ></iframe>
      </Dialog>
      {showInviteModal && (
        <InviteMembersModal onClose={() => setShowInviteModal(false)} />
      )}
    </>
  );
};
