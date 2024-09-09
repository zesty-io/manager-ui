import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, IconButton, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AddRounded, Close, EditRounded } from "@mui/icons-material";
import { MemoryRouter, useLocation, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { AppState } from "../../../../../../../../shell/store/types";
import {
  useCreateContentModelFieldMutation,
  useGetContentModelFieldsQuery,
  useUndeleteContentModelFieldMutation,
} from "../../../../../../../../shell/services/instance";
import { fetchItem } from "../../../../../../../../shell/store/content";
import {
  FieldTypeMedia,
  MediaItem,
} from "../../../../components/FieldTypeMedia";
import { MediaApp } from "../../../../../../../media/src/app";
import { useLazyGetFileQuery } from "../../../../../../../../shell/services/mediaManager";
import { isIS } from "@mui/x-date-pickers-pro";
import { fileExtension } from "../../../../../../../media/src/app/utils/fileUtils";

type MetaImageProps = {
  onChange: (value: string, name: string) => void;
};
export const MetaImage = ({ onChange }: MetaImageProps) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isCreateItemPage = location?.pathname?.split("/")?.pop() === "new";
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const item = useSelector(
    (state: AppState) =>
      state.content[isCreateItemPage ? `new:${modelZUID}` : itemZUID]
  );
  const fieldTypeMedia = useRef(null);
  const { data: modelFields } = useGetContentModelFieldsQuery(modelZUID);
  const [
    createContentModelField,
    {
      isLoading: isCreatingOgImageField,
      isSuccess: isOgImageFieldCreated,
      error: ogImageFieldCreationError,
    },
  ] = useCreateContentModelFieldMutation();
  const [
    undeleteContentModelField,
    { isLoading: isUndeletingField, isSuccess: isFieldUndeleted },
  ] = useUndeleteContentModelFieldMutation();
  const [getFile, { data }] = useLazyGetFileQuery();
  const [imageModal, setImageModal] = useState(null);
  const [autoOpenMediaBrowser, setAutoOpenMediaBrowser] = useState(false);
  const [temporaryMetaImageURL, setTemporaryMetaImageURL] =
    useState<string>(null);

  const isBynderSessionValid =
    localStorage.getItem("cvrt") && localStorage.getItem("cvad");

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
          // mediaFieldsWithImageOnTheName[field.name] = String(
          //   item.data[field.name]
          // ).split(",");
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
    if (!contentImages.length || temporaryMetaImageURL) return;
    // let breakLoop = false;

    // new Promise((resolve, reject) => {
    let validImages = contentImages.map(async (value, index) => {
      // console.log("break loop 1", breakLoop);
      // if (breakLoop) return true;

      // values.forEach(async (value) => {
      // console.log("break loop 2", breakLoop);
      // if (breakLoop) return true;

      const isZestyMediaFile = value.startsWith("3-");

      // if (isZestyMediaFile) {
      //   validImages.push(await getFile(value).unwrap());
      // } else {
      //   validImages.push(value);
      // }

      // if (value.startsWith("3-")) {
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
        // breakLoop = true;
        // setTemporaryMetaImageURL(value);
        // validImages.push(value);
        return value;
      }

      // if (index === contentImages.length - 1) {
      // console.log(validImages);
      // resolve(validImages);
      // }
      // } else {
      //   const isImage = [
      //     "png",
      //     "jpg",
      //     "jpeg",
      //     "svg",
      //     "gif",
      //     "tif",
      //     "webp",
      //   ].includes(fileExtension(value));

      //   if (isImage) {
      //     setTemporaryMetaImageURL(value);
      //   }
      // }
      // });
    });
    // }).then((value: string[]) => {
    // console.log("resolved urls", value);
    // setTemporaryMetaImageURL(value?.[0]);
    // });
    // Promise.all([validImages]).then(() => {
    //   console.log();
    // });

    Promise.all(validImages).then((data) => {
      // console.log(data);
      setTemporaryMetaImageURL(data?.[0]);
    });

    // if (!!validImages.length) {
    //   setTemporaryMetaImageURL(validImages[0]);
    // }
  }, [contentImages, temporaryMetaImageURL]);

  const getTemporaryImage = (mediaFields: Record<string, string[]>) => {
    let validImageUrl = "";

    Object.values(mediaFields).some((values) => {
      if (validImageUrl) return true;

      values.forEach(async (value) => {
        const isZestyMediaFile = value.startsWith("3-");
        // if (value.startsWith("3-")) {
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
          // console.log("is image", res.url);
          validImageUrl = isZestyMediaFile ? res.url : value;
        }
        //   } else {
        //     const isImage = [
        //       "png",
        //       "jpg",
        //       "jpeg",
        //       "svg",
        //       "gif",
        //       "tif",
        //       "webp",
        //     ].includes(fileExtension(value));

        //     if (isImage) {
        //       validImageUrl = value;
        //     }
        //   }
      });
    });
    console.log("valid image url", validImageUrl);
  };

  const usableTemporaryMetaImage = useMemo(() => {
    if (modelFields?.length) {
      let imageFields: string[] = [];

      modelFields.forEach((field) => {
        if (
          !field.deletedAt &&
          field.datatype === "images" &&
          field?.name !== "og_image" &&
          (field.label.toLowerCase().includes("image") ||
            field.name.toLocaleLowerCase().includes("image")) &&
          !!item?.data?.[field.name]
        ) {
          imageFields.push(String(item.data[field.name]));
        }
      });

      // if (imageFields.length) {
      //   imageFields.forEach(() => {});
      // }

      // Find the first matched field that already stores an image
      // matchedFields?.forEach((field) => {
      //   if (!image && !!item?.data?.[field.name]) {
      //     image = String(item?.data?.[field.name]);
      //   }
      // });

      // return image?.split(",")?.[0];
      return "";
    }
  }, [modelFields, item?.data]);

  const handleCreateOgImageField = () => {
    const existingOgImageField = modelFields?.find(
      (field) => field.name === "og_image"
    );

    if (!!existingOgImageField && !!existingOgImageField.deletedAt) {
      // If the og_image field already exists in the model but was deactivated, reactivate it
      undeleteContentModelField({
        modelZUID,
        fieldZUID: existingOgImageField.ZUID,
      });
    } else {
      // If the model has no og_image field yet, create it
      createContentModelField({
        modelZUID,
        body: {
          contentModelZUID: modelZUID,
          datatype: "images",
          description:
            "This field allows you to set an open graph image via the SEO tab. An Open Graph (OG) image is an image that appears on a social media post when a web page is shared.",
          label: "Meta Image",
          name: "og_image",
          required: false,
          settings: {
            defaultValue: null,
            group_id: "",
            limit: 1,
            list: false,
          },
          sort: modelFields?.length, // Adds it to the end of the current model's field list
        },
      });
    }
  };

  useEffect(() => {
    if (
      (!isCreatingOgImageField && isOgImageFieldCreated) ||
      (!isUndeletingField && isFieldUndeleted)
    ) {
      // Initiate the empty og_image field
      onChange(null, "og_image");
    }
  }, [
    isOgImageFieldCreated,
    isCreatingOgImageField,
    isUndeletingField,
    isFieldUndeleted,
  ]);

  useEffect(() => {
    // Automatically opens the media browser when the og_image field has no value
    if (autoOpenMediaBrowser && "og_image" in item?.data) {
      if (!item?.data?.["og_image"]) {
        fieldTypeMedia.current?.triggerOpenMediaBrowser();
      }
      setAutoOpenMediaBrowser(false);
    }
  }, [item?.data, autoOpenMediaBrowser]);

  // If there is already a field named og_image and it is storing a value
  if ("og_image" in item?.data && !!item?.data?.og_image) {
    const ogImageValue = item.data.og_image;

    return (
      <>
        <FieldShell
          settings={{
            label: "Meta Image",
          }}
          withInteractiveTooltip={false}
          customTooltip="This image appears in search engine and social media previews. It is recommended that these images are at least 1200px by 630px and have a 1.91:1 aspect ratio."
          errors={{}}
        >
          <FieldTypeMedia
            ref={fieldTypeMedia}
            name="og_image"
            limit={1}
            images={ogImageValue ? [String(ogImageValue)] : []}
            openMediaBrowser={(opts) => {
              setImageModal(opts);
            }}
            onChange={onChange}
            lockedToGroupId={null}
            settings={{
              fileExtensions: [
                ".png",
                ".jpg",
                ".jpeg",
                ".svg",
                ".gif",
                ".tif",
                ".webp",
              ],
              fileExtensionsErrorMessage:
                "Only files with the following extensions are allowed: .png, .jpg, .jpeg, .svg, .gif, .tif, .webp",
            }}
          />
        </FieldShell>
        {imageModal && (
          <MemoryRouter initialEntries={["/media?filetype=Image"]}>
            <Dialog
              open
              fullScreen
              sx={{ my: 2.5, mx: 10 }}
              PaperProps={{
                style: {
                  borderRadius: "4px",
                  overflow: "hidden",
                },
              }}
              onClose={() => setImageModal(null)}
            >
              <IconButton
                sx={{
                  position: "fixed",
                  right: 5,
                  top: 0,
                }}
                onClick={() => setImageModal(null)}
              >
                <Close sx={{ color: "common.white" }} />
              </IconButton>
              <MediaApp
                limitSelected={1}
                isSelectDialog={true}
                showHeaderActions={false}
                lockedToGroupId={null}
                addImagesCallback={(images) => {
                  imageModal.callback(images);
                  setImageModal(null);
                }}
                isReplace={imageModal.isReplace}
              />
            </Dialog>
          </MemoryRouter>
        )}
      </>
    );
  }

  // If there is a media field with an API ID containing the word "image" and is storing a file
  if (!!temporaryMetaImageURL) {
    return (
      <FieldShell
        settings={{
          label: "Meta Image",
        }}
        withInteractiveTooltip={false}
        customTooltip="This image appears in search engine and social media previews. It is recommended that these images are at least 1200px by 630px and have a 1.91:1 aspect ratio."
        errors={{}}
      >
        <Stack gap={1.25}>
          <MediaItem
            index={0}
            imageZUID={temporaryMetaImageURL}
            isBynderAsset={temporaryMetaImageURL.includes("bynder.com")}
            isBynderSessionValid={!!isBynderSessionValid}
            hideActionButtons
            hideDrag
          />
          <LoadingButton
            loading={isCreatingOgImageField || isUndeletingField}
            size="large"
            startIcon={<EditRounded />}
            variant="outlined"
            sx={{ width: "fit-content" }}
            onClick={() => {
              handleCreateOgImageField();
              setAutoOpenMediaBrowser(true);
            }}
          >
            Customize Image
          </LoadingButton>
        </Stack>
      </FieldShell>
    );
  }

  // If no image field
  return (
    <FieldShell
      settings={{
        label: "Meta Image",
      }}
      withInteractiveTooltip={false}
      customTooltip="This image appears in search engine and social media previews. It is recommended that these images are at least 1200px by 630px and have a 1.91:1 aspect ratio."
      errors={{}}
    >
      <LoadingButton
        loading={isCreatingOgImageField || isUndeletingField}
        size="large"
        startIcon={<AddRounded />}
        variant="outlined"
        sx={{ width: "fit-content", mt: 0.75 }}
        onClick={handleCreateOgImageField}
      >
        Add Meta Image
      </LoadingButton>
    </FieldShell>
  );
};
