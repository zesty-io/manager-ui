import {
  MenuBookRounded,
  BookRounded,
  RocketLaunchRounded,
  SvgIconComponent,
} from "@mui/icons-material";
import postmanIcon from "../../../../public/images/postmanIcon.svg";
import graphQLIcon from "../../../../public/images/graphQLIcon.svg";
import parsleyIcon from "../../../../public/images/parsleyIcon.svg";

interface MainDocItem {
  text: string;
  url: string;
  icon: SvgIconComponent | string;
  iconType: "icon" | "image";
  iconColor?: "primary" | "info";
}
interface SubDocItems {
  [key: string]: Pick<MainDocItem, "text" | "url">[];
}

export const MAIN_DOC_ITEMS: MainDocItem[] = [
  {
    text: "Get Started",
    url: "https://zesty.org/quick-start-guide",
    icon: RocketLaunchRounded,
    iconType: "icon",
    iconColor: "primary",
  },
  {
    text: "Platform Docs",
    url: "https://zesty.org",
    icon: MenuBookRounded,
    iconType: "icon",
    iconColor: "info",
  },
  {
    text: "Auth API Docs",
    url: "https://auth-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    text: "Instance API Docs",
    url: "https://instances-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    text: "GraphQL Docs",
    url: "https://zesty.org/apis/graphql",
    icon: graphQLIcon,
    iconType: "image",
  },
  {
    text: "Parsley Docs",
    url: "https://parsley.zesty.io",
    icon: parsleyIcon,
    iconType: "image",
  },
];

export const SUB_DOC_ITEMS: SubDocItems = {
  default: [
    {
      text: "Introduction",
      url: "https://zesty.org/",
    },
    {
      text: "Getting Started",
      url: "https://zesty.org/getting-started",
    },
    {
      text: "Guides",
      url: "https://zesty.org/guides",
    },
  ],
  content: [
    {
      text: "Content Overview",
      url: "https://zesty.org/services/manager-ui/content",
    },
    {
      text: "Content Entry, Drafts, and Publishing",
      url: "https://zesty.org/guides/content-entry-drafts-and-publishing",
    },
    {
      text: "Adding and Managing Content",
      url: "https://zesty.org/services/manager-ui/content/adding-and-managing-content",
    },
  ],
  media: [
    {
      text: "Media Overview",
      url: "https://zesty.org/services/manager-ui/media",
    },
    {
      text: "Adding Image Alt Text",
      url: "https://zesty.org/guides/adding-image-alt-text",
    },
    {
      text: "How to upload multiple images",
      url: "https://zesty.org/services/manager-ui/media/how-to-upload-multiple-images",
    },
  ],
  schema: [
    {
      text: "Schema Overview",
      url: "https://zesty.org/services/manager-ui/schema",
    },
    {
      text: "Building The Schema",
      url: "https://zesty.org/guides/building-the-schema-and-selecting-fields",
    },
    {
      text: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  code: [
    {
      text: "Code Overview",
      url: "https://zesty.org/services/manager-ui/editor",
    },
    {
      text: "Editor and Coding Basics",
      url: "https://zesty.org/guides/editor-and-coding-basics",
    },
    {
      text: "Schema, Content, and Code",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  leads: [
    {
      text: "Leads Overview",
      url: "https://zesty.org/services/manager-ui/leads",
    },
    {
      text: "Creating a Lead Form",
      url: "https://zesty.org/guides/how-to-create-a-lead-form",
    },
    {
      text: "Capturing form data to Leads",
      url: "https://zesty.org/services/web-engine/forms-and-form-webhooks#capturing-form-data-to-an-instances-leads-feature",
    },
  ],
  "reports/analytics": [
    {
      text: "Analytics Setup",
      url: "https://zesty.org/services/web-engine/analytics",
    },
    {
      text: "Analytics Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings#analytics",
    },
  ],
  seo: [
    {
      text: "SEO Overview",
      url: "https://zesty.org/services/manager-ui/health",
    },
    {
      text: "Manage Redirects",
      url: "https://zesty.org/services/manager-ui/health#manage-redirects",
    },
    {
      text: "SEO Redirects",
      url: "https://zesty.org/services/manager-ui/health/redirects",
    },
  ],
  "reports/audit-trail": [
    {
      text: "Audit Trail Overview",
      url: "https://zesty.org/services/manager-ui/audit-trail",
    },
  ],
  settings: [
    {
      text: "Settings Overview",
      url: "https://zesty.org/services/manager-ui/settings",
    },
    {
      text: "Instance Settings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings",
    },
  ],
};
