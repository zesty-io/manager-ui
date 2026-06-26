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
import { useTranslation } from "react-i18next";
import InviteMembersModal from "../../../../shell/components/InviteMembersModal";

interface Props {
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const ResourcesCard = ({ hideHeader, hideFooter }: Props) => {
  const { t } = useTranslation();
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
            primary={t("common.getStarted")}
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
            primary={t("common.platformDocs")}
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
            primary={t("common.instanceApiDocs")}
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
            primary={t("common.graphqlDocs")}
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
            primary={t("common.parsleyDocs")}
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
              primary={t("dashboard.releaseNotes")}
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
            {t("dashboard.resources")}
          </Typography>
          <Typography
            variant="body3"
            color="text.secondary"
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            {t("dashboard.resourcesSubtitle")}
          </Typography>
        </Box>
      )}
      {matureItems(false, false)}
      {!hideFooter && (
        <Box display="flex" justifyContent="space-between" padding={2}>
          <Typography
            variant="body3"
            color="text.secondary"
            sx={{ textTransform: "uppercase" }}
          >
            {t("dashboard.joinCommunity")}
          </Typography>
          <Box
            display="flex"
            gap={2}
            sx={{
              img: {
                cursor: "pointer",
                width: 20,
                height: 20,
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
