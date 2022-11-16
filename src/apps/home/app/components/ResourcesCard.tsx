import {
  Box,
  Typography,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from "@mui/material";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import postmanIcon from "../../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../../public/images/graphQLIcon.svg";
import starCheckIcon from "../../../../../public/images/starCheckIcon.svg";
import slackIcon from "../../../../../public/images/slackIcon.svg";
import youtubeIcon from "../../../../../public/images/youtubeIcon.svg";
import discordIcon from "../../../../../public/images/discordIcon.svg";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";

export const ResourcesCard = () => {
  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Box
      sx={{
        width: 327,
        backgroundColor: "common.white",
        border: (theme) => `1px solid ${theme.palette.border}`,
        borderRadius: "8px",
        height: "fit-content",
      }}
    >
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
      <ListItemButton
        divider
        onClick={() => handleNavigation("https://zesty.org/quick-start-guide")}
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
          <MenuBookRoundedIcon color="info" />
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
          <img src={graphQLIcon} />
        </ListItemIcon>
        <ListItemText
          primary="Parsley Docs"
          primaryTypographyProps={{
            variant: "body2",
          }}
        />
      </ListItemButton>
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
            onClick={() => handleNavigation("https://www.zesty.io/mindshare/")}
          />
        </Box>
      </Box>
    </Box>
  );
};
