import { useMemo, useState } from "react";
import { Stack, Typography, SvgIcon, Skeleton } from "@mui/material";
import { SettingsRounded, SvgIconComponent } from "@mui/icons-material";
import { Database } from "@zesty-io/material";
import { isEmpty } from "lodash";
import moment from "moment";

import { ResourceType } from "../../../../../../../shell/services/types";
import {
  useGetContentItemQuery,
  useGetContentModelsQuery,
} from "../../../../../../../shell/services/instance";
import {
  modelNameMap,
  modelIconMap,
} from "../../../../../../schema/src/app/utils";

type ResourceHeaderTitleProps = {
  affectedZUID: string;
  updatedAt: string;
  resourceType: "content" | "code" | "schema" | "settings";
  isLoadingActions: boolean;
};
export const ResourceHeaderTitle = ({
  affectedZUID,
  updatedAt,
  resourceType,
  isLoadingActions,
}: ResourceHeaderTitleProps) => {
  const { data: contentItem, isLoading: isLoadingContentItem } =
    useGetContentItemQuery(affectedZUID, {
      skip: resourceType !== "content",
    });
  const { data: contentModels, isLoading: isLoadingContentModels } =
    useGetContentModelsQuery();

  const isLoading =
    isLoadingContentItem || isLoadingContentModels || isLoadingActions;

  const headerData = useMemo(() => {
    const data = {
      title: "",
      subTitle: [
        `
        Last Updated: ${moment(updatedAt).format("Do MMMM YYYY [at] h:mm A")}
      `,
      ],
      icon: SettingsRounded,
    };

    if (resourceType === "content") {
      if (contentItem) {
        data.title = contentItem?.web?.metaTitle?.length
          ? contentItem?.web?.metaTitle
          : `${affectedZUID} (Missing Meta Title)`;

        const contentModel = contentModels?.find(
          (model) => model.ZUID === contentItem?.meta?.contentModelZUID
        );

        if (contentModel) {
          data.subTitle.unshift(
            `${modelNameMap[contentModel?.type]} Content Item` ?? ""
          );
        }

        data.icon = modelIconMap[contentModel?.type] as SvgIconComponent;
      } else {
        data.title = `${affectedZUID} (Deleted)`;
        data.icon = null;
      }
    } else if (resourceType === "schema") {
      const modelData = contentModels?.find(
        (model) => model.ZUID === affectedZUID
      );

      data.title = modelData?.label ?? `${affectedZUID} (Deleted)`;
      data.subTitle.unshift("Content Model");
      data.icon = Database as SvgIconComponent;
    }

    return data;
  }, [resourceType, contentItem, contentModels, updatedAt]);

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
