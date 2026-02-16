import {
  Stack,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { useHistory, useLocation, useParams } from "react-router";
import {
  ContentItem,
  Publishing,
} from "../../../../../../../../shell/services/types";
import {
  VerticalSplitRounded,
  QueryStatsRounded,
  BarChartRounded,
  CodeRounded,
  ApiRounded,
  ManageAccountsRounded,
  ContentCopyRounded,
  WebRounded,
  DesignServicesRounded,
} from "@mui/icons-material";
import { ShuffleVariant } from "@zesty-io/material";
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
import RedirectsDialogContextProvider from "../../../../../../../seo/src/app/components/RedirectsDialogProvider";

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
    label: "Redirects",
    icon: ShuffleVariant,
    value: "redirects",
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
  {
    label: "Studio",
    icon: DesignServicesRounded,
    value: "studio",
  },
];

type HeaderProps = {
  saving: boolean;
  onSave: () => void;
  hasError: boolean;
  isLoadingItem?: boolean;
};
export const ItemEditHeader = ({
  saving,
  onSave,
  hasError,
  isLoadingItem,
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

  const modelLabel = contentModels?.find(
    (model) => model.ZUID === modelZUID
  )?.label;
  const type =
    contentModels?.find((model) => model.ZUID === modelZUID)?.type ?? "";

  const layoutsAppInstalled = installedApps?.find(
    (app) => app.appZUID === "80-d8abaff6ef-wxs830"
  );

  const headerTitle = item?.web?.metaTitle || item?.web?.metaLinkText || "";
  const resolveStudioPath = () => {
    if (item?.web?.path) return item.web.path;
    if (item?.web?.pathPart === "zesty_home") return "/";
    if (item?.web?.pathPart)
      return item.web.pathPart.startsWith("/")
        ? item.web.pathPart
        : `/${item.web.pathPart}`;
    return "/";
  };

  return (
    <>
      <Box
        px={4}
        pt={4}
        pb={type === "block" ? 1 : 0}
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
            {isLoadingItem &&
            (!modelLabel || !item || !Object.keys(item?.web).length) ? (
              <Stack>
                <Typography
                  variant="h3"
                  sx={{
                    width: 667,
                  }}
                >
                  <Skeleton variant="text" />
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    width: 442,
                  }}
                >
                  <Skeleton variant="text" />
                </Typography>
              </Stack>
            ) : (
              <Typography
                variant="h3"
                fontWeight="700"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  wordBreak: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                  overflow: "hidden",
                }}
              >
                {(type === "block"
                  ? `${modelLabel}: ${headerTitle}`
                  : headerTitle) || ""}
              </Typography>
            )}
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
                minHeight: 32,
              }}
            >
              {isLoadingItem &&
              (!item ||
                !Object.keys(item.web).length ||
                !Object.keys(item.meta).length) ? (
                <Stack direction="row" gap={3} mr={1}>
                  <Skeleton variant="circular" width={16} height={16} />
                  <Skeleton variant="circular" width={16} height={16} />
                </Stack>
              ) : (
                <>
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
                  {type !== "dataset" && type !== "block" && <PreviewMenu />}
                </>
              )}
              {type === "block" && (
                <>
                  <LanguageSelector />
                  <VersionSelector activeVersion={item?.meta?.version} />
                </>
              )}
              <RedirectsDialogContextProvider>
                <ItemEditHeaderActions
                  saving={saving}
                  onSave={onSave}
                  hasError={hasError}
                  isLoadingItem={isLoadingItem}
                />
              </RedirectsDialogContextProvider>
            </Box>
            <PublishStatus currentVersion={item?.web?.version} />
          </Stack>
        </Box>
        {type !== "block" && (
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
              onChange={(event, value) => {
                if (value === "studio") {
                  history.push(`/studio?path=${resolveStudioPath()}`);
                  return;
                }

                history.push(
                  value
                    ? `/content/${modelZUID}/${itemZUID}/${value}`
                    : `/content/${modelZUID}/${itemZUID}`
                );
              }}
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
              <VersionSelector activeVersion={item?.meta?.version} />
            </Box>
          </Box>
        )}
      </Box>
      {showDuplicateItemDialog && (
        <DuplicateItemDialog
          onClose={() => setShowDuplicateItemDialog(false)}
        />
      )}
    </>
  );
};
