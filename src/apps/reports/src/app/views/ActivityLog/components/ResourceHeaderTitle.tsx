import { useMemo } from "react";
import { Stack, Typography, SvgIcon, Skeleton } from "@mui/material";
import {
  SettingsRounded,
  SvgIconComponent,
  CodeRounded,
} from "@mui/icons-material";
import { Database } from "@zesty-io/material";
import { useSelector } from "react-redux";

import {
  useGetContentItemQuery,
  useGetContentModelsQuery,
  useGetInstanceSettingsQuery,
  useGetLangsQuery,
  useGetWorkflowStatusLabelsQuery,
} from "../../../../../../../shell/services/instance";
import {
  modelNameMap,
  modelIconMap,
} from "../../../../../../schema/src/app/utils";
import { AppState } from "../../../../../../../shell/store/types";
import { isValid, format } from "date-fns";

type ResourceHeaderTitleProps = {
  affectedZUID: string;
  updatedAt: string;
  resourceType: "content" | "code" | "schema" | "settings";
  isLoadingActions: boolean;
  actionDescription: string;
};
export const ResourceHeaderTitle = ({
  affectedZUID,
  updatedAt,
  resourceType,
  isLoadingActions,
  actionDescription,
}: ResourceHeaderTitleProps) => {
  const { data: contentItem, isLoading: isLoadingContentItem } =
    useGetContentItemQuery(affectedZUID, {
      skip: resourceType !== "content",
    });
  const { data: contentModels, isLoading: isLoadingContentModels } =
    useGetContentModelsQuery();
  const { data: instanceSettings, isLoading: isLoadingInstanceSettings } =
    useGetInstanceSettingsQuery();
  const { data: langs, isLoading: isLoadingInstanceLangs } = useGetLangsQuery({
    type: "all",
  });
  const {
    data: workflowStatusLabels,
    isLoading: isLoadingWorkflowStatusLabels,
  } = useGetWorkflowStatusLabelsQuery({ showDeleted: true });
  const fileData = useSelector((state: AppState) =>
    Object.values(state.files).find((item) => item.ZUID === affectedZUID)
  );

  const isLoading =
    isLoadingContentItem ||
    isLoadingContentModels ||
    isLoadingActions ||
    isLoadingInstanceSettings ||
    isLoadingInstanceLangs ||
    isLoadingWorkflowStatusLabels;

  const headerData = useMemo(() => {
    const d = updatedAt ? new Date(updatedAt) : null;
    const data = {
      title: "",
      subTitle: [
        `
        Last Updated: ${
          d && isValid(d) ? format(d, "do MMMM yyyy 'at' h:mm a") : ""
        }
      `,
      ],
      icon: SettingsRounded,
    };

    switch (resourceType) {
      case "content":
        if (contentItem) {
          if (langs?.length === 1) {
            data.title = contentItem?.web?.metaTitle?.length
              ? contentItem?.web?.metaTitle
              : `${affectedZUID} (Missing Meta Title)`;
          } else {
            const lang = langs?.find(
              (lang) => lang.ID === contentItem?.meta?.langID
            );
            data.title = lang?.code
              ? `(${lang.code}) ${contentItem?.web?.metaTitle}`
              : contentItem?.web?.metaTitle ||
                `${affectedZUID} (Missing Meta Title)`;
          }

          const contentModel = contentModels?.find(
            (model) => model.ZUID === contentItem?.meta?.contentModelZUID
          );

          if (contentModel) {
            data.subTitle.unshift(
              `${modelNameMap[contentModel?.type]} Content Item`
            );
          }

          data.icon = modelIconMap[contentModel?.type] as SvgIconComponent;
        } else {
          data.title = `${affectedZUID} (Deleted)`;
          data.icon = null;
        }
        break;

      case "schema":
        const modelData = contentModels?.find(
          (model) => model.ZUID === affectedZUID
        );

        data.title = modelData?.label ?? `${affectedZUID} (Deleted)`;
        data.subTitle.unshift("Content Model");
        data.icon = Database as SvgIconComponent;
        break;

      case "code":
        data.title = fileData?.fileName;
        data.subTitle.unshift(modelNameMap[fileData?.type] ?? fileData?.type);
        data.icon = CodeRounded;
        break;

      case "settings":
        const settingsData = instanceSettings?.find(
          (setting) => setting.ZUID === affectedZUID
        );

        switch (affectedZUID?.split("-")?.[0]) {
          case "29":
            data.title = settingsData?.keyFriendly || actionDescription;
            break;

          case "21":
            data.title = "Head Tag";
            break;

          case "36":
            const workflowStatusData = workflowStatusLabels?.find(
              (label) => label.ZUID === affectedZUID
            );

            if (workflowStatusData?.name) {
              data.title = actionDescription?.replace(
                /`([^`]+)`/g,
                `${workflowStatusData?.name}`
              );
            } else {
              data.title = actionDescription;
            }
            break;

          default:
            data.title = actionDescription;
            break;
        }

        data.subTitle.unshift("Settings");
        data.icon = SettingsRounded;
        break;

      default:
        break;
    }

    return data;
  }, [
    resourceType,
    contentItem,
    contentModels,
    updatedAt,
    fileData,
    instanceSettings,
  ]);

  return (
    <Stack gap={0.25}>
      <Typography variant="h3" fontWeight={700} maxWidth={640}>
        {isLoading ? <Skeleton /> : headerData.title}
      </Typography>
      <Stack direction="row" gap={0.25}>
        {isLoading ? (
          <Skeleton width="100%" />
        ) : (
          <>
            {headerData.icon && (
              <SvgIcon
                component={headerData.icon}
                sx={{
                  color: "text.secondary",
                  fontSize: "18px",
                }}
              />
            )}
            <Typography variant="body3" color="text.secondary">
              {headerData.subTitle.join(" • ")}
            </Typography>
          </>
        )}
      </Stack>
    </Stack>
  );
};
