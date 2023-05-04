import { useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Typography,
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LanguageIcon from "@mui/icons-material/Language";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import BookIcon from "@mui/icons-material/Book";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import postmanIcon from "../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../public/images/graphQLIcon.svg";
import parsleyIcon from "../../../../public/images/parsleyIcon.svg";
import starCheckIcon from "../../../../public/images/starCheckIcon.svg";
import CollectionsBookmarkRoundedIcon from "@mui/icons-material/CollectionsBookmarkRounded";

import { AppState } from "../../store/types";
interface Props {
  onClose?: () => void;
  instanceZUID?: string;
}

const defaultLinks = [
  {
    name: "Introduction",
    url: "https://zesty.org/",
  },
  {
    name: "Getting Started",
    url: "https://zesty.org/getting-started",
  },
  {
    name: "Guides",
    url: "https://zesty.org/guides",
  },
];
const linkMap = {
  content: [
    {
      name: "Content Overview",
      url: "https://zesty.org/services/manager-ui/content",
    },
    {
      name: "Content Entry, Drafts, and Publishing",
      url: "https://zesty.org/guides/content-entry-drafts-and-publishing",
    },
    {
      name: "Adding and Managing Content",
      url: "https://zesty.org/services/manager-ui/content/adding-and-managing-content",
    },
  ],
  media: [
    {
      name: "Media Overview",
      url: "https://zesty.org/services/manager-ui/media",
    },
    {
      name: "Adding Image Alt Text",
      url: "https://zesty.org/guides/adding-image-alt-text",
    },
    {
      name: "How to upload multiple images",
      url: "https://zesty.org/services/manager-ui/media/how-to-upload-multiple-images",
    },
  ],
  schema: [
    {
      name: "Schema Overview",
      url: "https://zesty.org/services/manager-ui/schema",
    },
    {
      name: "Building The Schema",
      url: "https://zesty.org/guides/building-the-schema-and-selecting-fields",
    },
    {
      name: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  code: [
    {
      name: "Code Overview",
      url: "https://zesty.org/services/manager-ui/editor",
    },
    {
      name: "Editor and Coding Basics",
      url: "https://zesty.org/guides/editor-and-coding-basics",
    },
    {
      name: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  leads: [
    {
      name: "Leads Overview",
      url: "https://zesty.org/services/manager-ui/leads",
    },
    {
      name: "Creating a Lead Form",
      url: "https://zesty.org/guides/how-to-create-a-lead-form",
    },
    {
      name: "Capturing form data to Leads",
      url: "https://zesty.org/services/web-engine/forms-and-form-webhooks#capturing-form-data-to-an-instances-leads-feature",
    },
  ],
  "reports/analytics": [
    {
      name: "Analytics Setup",
      url: "https://zesty.org/services/web-engine/analytics",
    },
    {
      name: "Analytics Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings#analytics",
    },
  ],
  seo: [
    {
      name: "SEO Overview",
      url: "https://zesty.org/services/manager-ui/health",
    },
    {
      name: "Manage Redirects",
      url: "https://zesty.org/services/manager-ui/health#manage-redirects",
    },
    {
      name: "SEO Redirects",
      url: "https://zesty.org/services/manager-ui/health/redirects",
    },
  ],
  "reports/audit-trail": [
    {
      name: "Audit Trail Overview",
      url: "https://zesty.org/services/manager-ui/audit-trail",
    },
  ],
  settings: [
    {
      name: "Settings Overview",
      url: "https://zesty.org/services/manager-ui/settings",
    },
    {
      name: "Instance Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings",
    },
  ],
};

const DocsMenu = ({ onClose, instanceZUID }: Props) => {
  const instance = useSelector((state: AppState) => state.instance);
  const mainApp = location.pathname.split("/")[1];
  const subApp = location.pathname.split("/")[2];
  const section = mainApp === "reports" ? `reports/${subApp}` : mainApp;

  // @ts-ignore
  const links = linkMap[section] || defaultLinks;

  const handleNavigation = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => onClose()}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Docs
          </Typography>
        </Box>
        <Box>
          <Link
            title="Support"
            href="mailto:support@zesty.io"
            color="secondary"
            underline="none"
          >
            <Button
              variant="contained"
              color="inherit"
              size="small"
              startIcon={<EmailIcon fontSize="small" />}
            >
              support@zesty.io
            </Button>
          </Link>
          <Button
            variant="contained"
            color="inherit"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => {
              window.open(`https://www.zesty.io/chat/`, "_blank");
            }}
            startIcon={<ChatIcon fontSize="small" />}
          >
            Get Help
          </Button>
        </Box>
      </Box>

      {/* Docs items */}
      <Box>
        <Box sx={{ display: "flex" }}>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() =>
              handleNavigation("https://zesty.org/quick-start-guide")
            }
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <RocketLaunchRoundedIcon color="primary" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Get Started"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() => handleNavigation("https://zesty.org/")}
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <MenuBookRoundedIcon color="info" fontSize="large" />
            </ListItemIcon>
            <ListItemText
              primary="Platform Docs"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() => handleNavigation("https://accounts-api.zesty.org/")}
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <img src={postmanIcon} width="32px" height="32px" />
            </ListItemIcon>
            <ListItemText
              primary="Auth API"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
        </Box>
        <Box sx={{ display: "flex" }}>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() => handleNavigation("https://instances-api.zesty.org/")}
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <img src={postmanIcon} width="32px" height="32px" />
            </ListItemIcon>
            <ListItemText
              primary="Instance API Docs"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() =>
              handleNavigation("https://github.com/zesty-io/graphql-zesty")
            }
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <img src={graphQLIcon} width="32px" height="32px" />
            </ListItemIcon>
            <ListItemText
              primary="GraphQL Docs"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
          <ListItemButton
            sx={{
              width: "138.67px",
              height: "88px",
              display: "block",
              textAlign: "center",
            }}
            onClick={() => handleNavigation("https://parsley.zesty.io/")}
          >
            <ListItemIcon sx={{ minWidth: "32px" }}>
              <img width="32px" height="32px" src={parsleyIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Parsley Docs"
              primaryTypographyProps={{
                variant: "body3",
              }}
            />
          </ListItemButton>
        </Box>
      </Box>

      {/* Learn section */}
      <Box>
        <Typography variant="body1" sx={{ ml: 2, mb: 1 }}>
          Learn
        </Typography>
        <Divider />
        {links.map((link: any) => (
          <>
            <ListItem
              onClick={() => handleNavigation(link.url)}
              sx={{
                cursor: "pointer",
                py: "4px",
              }}
            >
              <ListItemIcon sx={{ minWidth: "35px" }}>
                <BookIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  variant: "body2",
                }}
              >
                {link.name}
              </ListItemText>
            </ListItem>
            <Divider />
          </>
        ))}
      </Box>
    </Box>
  );
};

export default DocsMenu;
