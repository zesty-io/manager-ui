import {
  Stack,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { theme } from "@zesty-io/material";
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
  WebRounded,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ItemEditHeaderActions } from "./ItemEditHeaderActions";
import { VersionSelector } from "./VersionSelector";
import { LanguageSelector } from "./LanguageSelector";
import { ContentBreadcrumbs } from "../../../../components/ContentBreadcrumbs";
import { MoreMenu } from "./MoreMenu";
import { DuplicateItemDialog } from "./DuplicateItemDialog";
import { useState } from "react";
import { PreviewMenu } from "./PreviewMenu";
import { useGetInstalledAppsQuery } from "../../../../../../../../shell/services/accounts";
import { DuoModeSwitch } from "./DuoModeToggle";
import { useGetContentModelsQuery } from "../../../../../../../../shell/services/instance";
import { ContentItemWithDirtyAndPublishing } from "../../../../../../../../shell/services/types";
import { PublishStatus } from "./PublishStatus";

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
  {
    label: "Freestyle",
    icon: WebRounded,
    value: "freestyle",
  },
];

type HeaderProps = {
  saving: boolean;
  onSave: () => void;
  hasError: boolean;
  headerTitle: string;
};
export const ItemEditHeader = ({
  saving,
  onSave,
  hasError,
  headerTitle,
}: HeaderProps) => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const location = useLocation();
  const history = useHistory();
  const [showDuplicateItemDialog, setShowDuplicateItemDialog] = useState(false);
  const { data: installedApps } = useGetInstalledAppsQuery();
  const { data: contentModels } = useGetContentModelsQuery();

  const item = useSelector(
    (state: AppState) =>
      state.content[itemZUID] as ContentItemWithDirtyAndPublishing
  );

  const type =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ?? "";

  const layoutsAppInstalled = installedApps?.find(
    (app) => app.appZUID === "80-d8abaff6ef-wxs830"
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
            borderBottom: (theme) => `2px solid ${theme?.palette?.border} `,
            "*": {
              boxSizing: "border-box",
            },
            containerType: "inline-size",
          }}
        >
          <Box display="flex" justifyContent="space-between" gap={4}>
            <Box>
              <ContentBreadcrumbs />
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
                }}
              >
                {headerTitle || ""}
              </Typography>
            </Box>
            <Stack gap={1.25}>
              <Box
                display="flex"
                gap={1}
                alignItems="center"
                sx={{
                  "@container (max-width: 900px)": {
                    flexWrap: "wrap",
                  },
                }}
              >
                <MoreMenu />
                <Tooltip
                  title="Duplicate Item"
                  enterDelay={1000}
                  enterNextDelay={1000}
                  placement="bottom-start"
                >
                  <IconButton
                    size="small"
                    onClick={() => setShowDuplicateItemDialog(true)}
                  >
                    <ContentCopyRounded fontSize="small" />
                  </IconButton>
                </Tooltip>
                {type !== "dataset" && <PreviewMenu />}
                <ItemEditHeaderActions
                  saving={saving}
                  onSave={onSave}
                  hasError={hasError}
                />
              </Box>
              <PublishStatus currentVersion={item?.web?.version} />
            </Stack>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
          >
            <Tabs
              variant="scrollable"
              scrollButtons={false}
              value={
                tabs.find(
                  (tab) =>
                    tab.label !== "Content" &&
                    location.pathname.includes(tab.value)
                )?.value || ""
              }
              onChange={(event, value) =>
                history.push(
                  value
                    ? `/content/${modelZUID}/${itemZUID}/${value}`
                    : `/content/${modelZUID}/${itemZUID}`
                )
              }
              sx={{
                position: "relative",
                top: "2px",
              }}
            >
              {tabs.map((tab) => {
                if (tab.label === "Freestyle" && !layoutsAppInstalled) {
                  return;
                } else
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
