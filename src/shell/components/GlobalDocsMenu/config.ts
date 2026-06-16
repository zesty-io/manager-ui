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
  // Translation key resolved at render time via t(). These arrays are module
  // level, where t() can't run, so labels live as keys and are translated in
  // the component.
  textKey: string;
  url: string;
  icon: SvgIconComponent | string;
  iconType: "icon" | "image";
  iconColor?: "primary" | "info";
}
interface SubDocItems {
  [key: string]: Pick<MainDocItem, "textKey" | "url">[];
}

export const MAIN_DOC_ITEMS: MainDocItem[] = [
  {
    textKey: "common.getStarted",
    url: "https://zesty.org/quick-start-guide",
    icon: RocketLaunchRounded,
    iconType: "icon",
    iconColor: "primary",
  },
  {
    textKey: "common.platformDocs",
    url: "https://zesty.org",
    icon: MenuBookRounded,
    iconType: "icon",
    iconColor: "info",
  },
  {
    textKey: "shell.docsAuthApi",
    url: "https://auth-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    textKey: "common.instanceApiDocs",
    url: "https://instances-api.zesty.org",
    icon: postmanIcon,
    iconType: "image",
  },
  {
    textKey: "common.graphqlDocs",
    url: "https://zesty.org/apis/graphql",
    icon: graphQLIcon,
    iconType: "image",
  },
  {
    textKey: "common.parsleyDocs",
    url: "https://parsley.zesty.io",
    icon: parsleyIcon,
    iconType: "image",
  },
];

export const SUB_DOC_ITEMS: SubDocItems = {
  default: [
    {
      textKey: "shell.docsIntroduction",
      url: "https://zesty.org/",
    },
    {
      textKey: "shell.docsGettingStarted",
      url: "https://zesty.org/getting-started",
    },
    {
      textKey: "shell.docsGuides",
      url: "https://zesty.org/guides",
    },
  ],
  content: [
    {
      textKey: "shell.docsContentOverview",
      url: "https://zesty.org/services/manager-ui/content",
    },
    {
      textKey: "shell.docsContentEntry",
      url: "https://zesty.org/guides/content-entry-drafts-and-publishing",
    },
    {
      textKey: "shell.docsAddingManagingContent",
      url: "https://zesty.org/services/manager-ui/content/adding-and-managing-content",
    },
  ],
  media: [
    {
      textKey: "shell.docsMediaOverview",
      url: "https://zesty.org/services/manager-ui/media",
    },
    {
      textKey: "shell.docsAddingImageAltText",
      url: "https://zesty.org/guides/adding-image-alt-text",
    },
    {
      textKey: "shell.docsUploadMultipleImages",
      url: "https://zesty.org/services/manager-ui/media/how-to-upload-multiple-images",
    },
  ],
  schema: [
    {
      textKey: "shell.docsSchemaOverview",
      url: "https://zesty.org/services/manager-ui/schema",
    },
    {
      textKey: "shell.docsBuildingSchema",
      url: "https://zesty.org/guides/building-the-schema-and-selecting-fields",
    },
    {
      textKey: "shell.docsSchemaContentCode",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  code: [
    {
      textKey: "shell.docsCodeOverview",
      url: "https://zesty.org/services/manager-ui/editor",
    },
    {
      textKey: "shell.docsEditorCodingBasics",
      url: "https://zesty.org/guides/editor-and-coding-basics",
    },
    {
      textKey: "shell.docsSchemaContentCode",
      url: "https://zesty.org/guides/the-connection-between-schema-content-and-code",
    },
  ],
  leads: [
    {
      textKey: "shell.docsLeadsOverview",
      url: "https://zesty.org/services/manager-ui/leads",
    },
    {
      textKey: "shell.docsCreatingLeadForm",
      url: "https://zesty.org/guides/how-to-create-a-lead-form",
    },
    {
      textKey: "shell.docsCapturingFormData",
      url: "https://zesty.org/services/web-engine/forms-and-form-webhooks#capturing-form-data-to-an-instances-leads-feature",
    },
  ],
  redirects: [
    {
      textKey: "shell.docsRedirectsOverview",
      url: "https://zesty.org/services/manager-ui/health",
    },
    {
      textKey: "shell.docsManageRedirects",
      url: "https://zesty.org/services/manager-ui/health#manage-redirects",
    },
    {
      textKey: "shell.docsSeoRedirects",
      url: "https://zesty.org/services/manager-ui/health/redirects",
    },
  ],
  "reports/audit-trail": [
    {
      textKey: "shell.docsAuditTrailOverview",
      url: "https://zesty.org/services/manager-ui/audit-trail",
    },
  ],
  settings: [
    {
      textKey: "shell.docsSettingsOverview",
      url: "https://zesty.org/services/manager-ui/settings",
    },
    {
      textKey: "shell.docsInstanceSettings",
      url: "https://zesty.org/services/manager-ui/settings/instance-settings",
    },
  ],
};
