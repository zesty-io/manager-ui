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
import discordIcon from "../../../../../public/images/discordIcon.svg";
import salesAvatar from "../../../../../public/images/salesAvatar.png";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import CollectionsBookmarkRoundedIcon from "@mui/icons-material/CollectionsBookmarkRounded";
import { useState } from "react";

interface Props {
  isMature: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const ResourcesCard = ({ isMature, hideHeader, hideFooter }: Props) => {
  const [showMeetModal, setShowMeetModal] = useState(false);

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

  const newItems = () => {
    const videos = [
      {
        url: "https://www.youtube.com/watch?v=Y2cux28b9q0",
        title: "Build in Zesty using Next.js (Headless)",
        length: "9:50",
      },
      {
        url: "https://www.youtube.com/watch?v=vt7TB0ES-y0",
        title: "Build in Zesty using Parsley",
        length: "33:47",
      },
      {
        url: "https://www.youtube.com/watch?v=cIBSt0emuvQ",
        title: "Build in Zesty using a custom framework",
        length: "1:25:01",
      },
    ];

    return (
      <>
        <ListItemButton divider onClick={() => setShowMeetModal(true)}>
          <ListItemIcon sx={{ minWidth: "36px" }}>
            <img src={salesAvatar} />
          </ListItemIcon>
          <ListItemText
            primary="Schedule Onboarding Call"
            secondary="We'll get you started in just 20 minutes"
            primaryTypographyProps={{
              variant: "body2",
            }}
          />
        </ListItemButton>
        <Accordion sx={{ boxShadow: "none" }} disableGutters>
          <AccordionSummary expandIcon={<KeyboardArrowUpIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <CodeRoundedIcon color="info" />
              <Box>
                <Typography variant="body2">
                  Connect to your Website or App
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Videos on how to build with Zesty
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box display="flex" gap={2} flexDirection="column">
              {videos.map((video) => (
                <Box
                  display="flex"
                  gap={2}
                  onClick={() => window.open(video.url, "_blank")}
                  sx={{ cursor: "pointer" }}
                >
                  <Box sx={{ borderRadius: 1 }}>
                    <img
                      width="96"
                      height="64"
                      src={`https://img.youtube.com/vi/${video.url
                        ?.split("=")
                        ?.pop()}/0.jpg`}
                      style={{ borderRadius: "8px" }}
                    ></img>
                  </Box>
                  <Box>
                    <Typography variant="body2">{video.title}</Typography>
                    {/* @ts-expect-error body3 module augmentation required */}
                    <Typography variant="body3" color="text.secondary">
                      {video.length}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ boxShadow: "none" }} disableGutters>
          <AccordionSummary expandIcon={<KeyboardArrowUpIcon />}>
            <Box display="flex" alignItems="center" gap={2}>
              <MenuBookRoundedIcon color="info" />
              <Box>
                <Typography variant="body2">Docs</Typography>
                <Typography variant="caption" color="text.secondary">
                  Learn about our platform &amp; API
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>{matureItems(true, true)}</AccordionDetails>
        </Accordion>
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
            // @ts-ignore
            variant="body3"
            color="text.secondary"
            fontWeight={600}
            sx={{ mt: 1 }}
          >
            Everything you need to get the best out of Zesty.
          </Typography>
        </Box>
      )}
      {isMature ? matureItems(false, false) : newItems()}
      {!hideFooter && (
        <Box display="flex" justifyContent="space-between" padding={2}>
          {/* @ts-ignore */}
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
            <img
              src={discordIcon}
              onClick={() => handleNavigation("https://discord.gg/uqDqeX8RXE")}
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
          src="https://www.zesty.io/meet/"
        ></iframe>
      </Dialog>
    </>
  );
};
