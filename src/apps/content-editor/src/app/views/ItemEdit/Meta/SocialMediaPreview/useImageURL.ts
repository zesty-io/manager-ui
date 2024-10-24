import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";

import { useGetContentModelFieldsQuery } from "../../../../../../../../shell/services/instance";
import { useLazyGetFileQuery } from "../../../../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../../../../shell/store/types";
import { fileExtension } from "../../../../../../../media/src/app/utils/fileUtils";

export const useImageURL: () => string = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const [getFile] = useLazyGetFileQuery();
  const location = useLocation();
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );
  const [imageURL, setImageURL] = useState<string>(null);

  const contentImages = useMemo(() => {
    if (!modelFields?.length || !Object.keys(item?.data ?? {})?.length) return;

    const mediaFieldsWithImageOnTheName: string[] = [];
    const otherMediaFields: string[] = [];

    modelFields.forEach((field) => {
      if (
        !field.deletedAt &&
        field.datatype === "images" &&
        field?.name !== "og_image" &&
        !!item?.data?.[field.name]
      ) {
        if (
          field.label.toLowerCase().includes("image") ||
          field.name.toLocaleLowerCase().includes("image")
        ) {
          mediaFieldsWithImageOnTheName.push(
            ...String(item.data[field.name]).split(",")
          );
        } else {
          otherMediaFields.push(...String(item.data[field.name]).split(","));
        }
      }
    });

    return [...mediaFieldsWithImageOnTheName, ...otherMediaFields];
  }, [modelFields, item?.data]);

  useEffect(() => {
    if (!!item?.data?.og_image) {
      if (String(item.data.og_image).startsWith("3-")) {
        getFile(String(item.data.og_image))
          .unwrap()
          .then((res) => {
            setImageURL(res.url);
          });
      } else {
        setImageURL(String(item.data.og_image));
      }
    } else {
      if (!contentImages?.length) {
        setImageURL(null);
        return;
      }

      let validImages = contentImages.map(async (value) => {
        const isZestyMediaFile = value.startsWith("3-");
        // Need to resolve media zuids to determine if these are actually images
        const res = isZestyMediaFile && (await getFile(value).unwrap());
        const isImage = [
          "png",
          "jpg",
          "jpeg",
          "svg",
          "gif",
          "tif",
          "webp",
        ].includes(fileExtension(isZestyMediaFile ? res.url : value));

        if (isImage) {
          return isZestyMediaFile ? res.url : value;
        }
      });

      Promise.all(validImages).then((data) => {
        setImageURL(data?.[0]);
      });
    }
  }, [JSON.stringify(contentImages), item?.data?.og_image]);

  return imageURL;
};
