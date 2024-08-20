import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";
import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";
import { AppState } from "../../../../../../../../shell/store/types";

type ImageDimension = {
  type?: "crop" | "fit";
  width?: number;
  height?: number;
};
type UseImageURLProps = [string, (imageDimensions: ImageDimension) => void];
export const useImageURL: () => UseImageURLProps = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const location = useLocation();
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );
  const [imageDimensions, setImageDimensions] = useState<ImageDimension>({});

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
      const params = {
        type: imageDimensions?.type || "crop",
        ...(!!imageDimensions?.width && {
          w: String(imageDimensions.width),
        }),
        ...(!!imageDimensions?.height && {
          h: String(imageDimensions.height),
        }),
      };
      const url = new URL(
        `${
          // @ts-ignore
          CONFIG.SERVICE_MEDIA_RESOLVER
        }/resolve/${matchedURL}/getimage/`
      );
      url.search = new URLSearchParams(params)?.toString();

      return url.toString();
    } else {
      return matchedURL;
    }
  }, [item?.data, modelFields, imageDimensions]);

  return [imageURL, setImageDimensions];
};
