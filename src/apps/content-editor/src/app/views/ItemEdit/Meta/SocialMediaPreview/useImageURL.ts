import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../../shell/store/types";

export const useImageURL: () => string = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const item = useSelector((state: AppState) => state.content[itemZUID]);

  const imageURL: string = useMemo(() => {
    if (!item?.data || !modelFields?.length) return;

    let matchedURL: string | null = null;

    if ("og_image" in item?.data) {
      matchedURL = !!item?.data?.["og_image"]
        ? (item?.data?.["og_image"] as string)
        : null;
    } else {
      // Find possible image fields that can be used
      const matchedFields = modelFields.filter(
        (field) =>
          !field.deletedAt &&
          field.datatype === "images" &&
          field?.name !== "og_image" &&
          (field.label.toLowerCase().includes("image") ||
            field.name.toLocaleLowerCase().includes("image"))
      );

      if (matchedFields?.length) {
        // Find the first matched field that already stores an image and make sure
        // to find the first valid image in that field
        matchedFields.forEach((field) => {
          if (!matchedURL && !!item?.data?.[field.name]) {
            matchedURL = String(item?.data?.[field.name])?.split(",")?.[0];
          }
        });
      }
    }

    if (matchedURL?.startsWith("3-")) {
      return `${
        // @ts-ignore
        CONFIG.SERVICE_MEDIA_RESOLVER
      }/resolve/${matchedURL}/getimage/?w=${85}&h=${85}&type=fit`;
    } else {
      return matchedURL;
    }
  }, [item?.data, modelFields]);

  return imageURL;
};
