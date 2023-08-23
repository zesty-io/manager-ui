import { Box, Tabs, Tab, Typography, IconButton } from "@mui/material";
import { useGetContentModelQuery } from "../../../../../../../../shell/services/instance";
import { ScreenShare, theme } from "@zesty-io/material";
import { useHistory, useLocation, useParams } from "react-router";
import {
  ContentItem,
  Publishing,
} from "../../../../../../../../shell/services/types";
import { ThemeProvider } from "@mui/material/styles";
import {
  VerticalSplitRounded,
  QueryStatsRounded,
  BarChartRounded,
  CodeRounded,
  ApiRounded,
  ManageAccountsRounded,
  ContentCopyRounded,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ItemEditHeaderActions } from "./ItemEditHeaderActions";
import { VersionSelector } from "./VersionSelector";
import { LanguageSelector } from "./LanguageSelector";
import { ItemEditBreadcrumbs } from "./ItemEditBreadcrumbs";
import { DuoModeSwitch } from "./DuoModeToggle";
import { MoreMenu } from "./MoreMenu";
import { DuplicateItemDialog } from "./DuplicateItemDialog";
import { useState } from "react";
import { PreviewMenu } from "./PreviewMenu";

const tabs = [
  {
    label: "Content",
    icon: VerticalSplitRounded,
    value: "",
  },
  {
    label: "SEO",
    icon: QueryStatsRounded,
    value: "meta",
  },
  {
    label: "Analytics",
    icon: BarChartRounded,
    value: "analytics",
  },
  {
    label: "Head Tags",
    icon: CodeRounded,
    value: "head",
  },
  {
    label: "APIs",
    icon: ApiRounded,
    value: "api",
  },
  {
    label: "Publish Status",
    icon: ManageAccountsRounded,
    value: "publishings",
  },
];

export type ContentItemWithDirtyAndPublishing = ContentItem & {
  dirty: boolean;
  publishing: Publishing;
  scheduling: any;
};

type HeaderProps = {
  saving: boolean;
  onSave: () => void;
};
export const ItemEditHeader = ({ saving, onSave }: HeaderProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const location = useLocation();
  const history = useHistory();
  const [showDuplicateItemDialog, setShowDuplicateItemDialog] = useState(false);

  const { data: model } = useGetContentModelQuery(modelZUID);
  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );

  return (
    <ThemeProvider theme={theme}>
      <>
        <Box
          px={4}
          pt={4}
          sx={{
            backgroundColor: "background.paper",
            color: "text.primary",
            borderBottom: (theme) => `2px solid ${theme?.palette?.divider} `,
            "*": {
              boxSizing: "border-box",
            },
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <ItemEditBreadcrumbs />
              <Typography
                variant="h3"
                fontWeight="700"
                sx={{
                  display: "-webkit-box",
                  "-webkit-line-clamp": "2",
                  "-webkit-box-orient": "vertical",
                  wordBreak: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                  overflow: "hidden",
                  mb: 2,
                }}
              >
                {item?.web?.metaTitle || item?.web?.metaLinkText}
              </Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center" height="32px">
              <MoreMenu />
              <IconButton
                size="small"
                onClick={() => setShowDuplicateItemDialog(true)}
              >
                <ContentCopyRounded fontSize="small" />
              </IconButton>
              <PreviewMenu />
              <ItemEditHeaderActions saving={saving} onSave={onSave} />
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Tabs
              value={
                tabs.find(
                  (tab) =>
                    tab.label !== "Content" &&
                    location.pathname.includes(tab.value)
                )?.value || ""
              }
              onChange={(event, value) =>
                history.push(`/content/${modelZUID}/${itemZUID}/${value}`)
              }
              sx={{
                position: "relative",
                top: "2px",
              }}
            >
              {tabs.map((tab) => {
                if (tab.value === "meta" && model?.type === "dataset") return;
                return (
                  <Tab
                    key={tab.value}
                    disableRipple
                    label={tab.label}
                    value={tab.value}
                    icon={<tab.icon fontSize="small" />}
                    iconPosition="start"
                  />
                );
              })}
            </Tabs>
            <Box display="flex" gap={2} alignItems="center">
              <DuoModeSwitch />
              <LanguageSelector />
              <VersionSelector />
            </Box>
          </Box>
        </Box>
        {showDuplicateItemDialog && (
          <DuplicateItemDialog
            onClose={() => setShowDuplicateItemDialog(false)}
          />
        )}
      </>
    </ThemeProvider>
  );
};
