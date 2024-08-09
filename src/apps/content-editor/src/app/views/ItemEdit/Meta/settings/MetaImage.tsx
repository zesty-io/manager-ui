import { useState, useEffect } from "react";
import { Dialog, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AddRounded, Close } from "@mui/icons-material";
import { MemoryRouter, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { AppState } from "../../../../../../../../shell/store/types";
import { useCreateContentModelFieldMutation } from "../../../../../../../../shell/services/instance";
import { fetchItem } from "../../../../../../../../shell/store/content";
import { FieldTypeMedia } from "../../../../components/FieldTypeMedia";
import { MediaApp } from "../../../../../../../media/src/app";

type MetaImageProps = {
  onChange: (value: string, name: string) => void;
};
export const MetaImage = ({ onChange }: MetaImageProps) => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const item = useSelector((state: AppState) => state.content[itemZUID]);
  const [
    createContentModelField,
    {
      isLoading: isCreatingOgImageField,
      isSuccess: isOgImageFieldCreated,
      error: ogImageFieldCreationError,
    },
  ] = useCreateContentModelFieldMutation();
  const [imageModal, setImageModal] = useState(null);

  // If there is any image field

  const handleCreateOgImageField = () => {
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
        sort: Object.keys(item?.data)?.length,
      },
    });
  };

  useEffect(() => {
    if (!isCreatingOgImageField && isOgImageFieldCreated) {
      // Refetch the current item so that we can get the newly-created og_image field
      dispatch(fetchItem(modelZUID, itemZUID));
    }
  }, [isOgImageFieldCreated, isCreatingOgImageField]);

  // If there is already a field named og_image
  if ("og_image" in item?.data) {
    const ogImageValue = item?.data?.["og_image"] as string;

    return (
      <>
        <FieldShell
          settings={{
            label: "Meta Image",
            required: true,
          }}
          withInteractiveTooltip={false}
          customTooltip="This image appears in search engine and social media previews. It is recommended that these images are at least 1200px by 630px and have a 1.91:1 aspect ratio."
          errors={{}}
        >
          <FieldTypeMedia
            name="og_image"
            limit={1}
            images={ogImageValue ? [ogImageValue] : []}
            openMediaBrowser={(opts) => {
              setImageModal(opts);
            }}
            onChange={onChange}
            lockedToGroupId={null}
          />
        </FieldShell>
        {imageModal && (
          <MemoryRouter>
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

  // If no image field
  return (
    <FieldShell
      settings={{
        label: "Meta Image",
        required: true,
      }}
      withInteractiveTooltip={false}
      customTooltip="This image appears in search engine and social media previews. It is recommended that these images are at least 1200px by 630px and have a 1.91:1 aspect ratio."
      errors={{}}
    >
      <LoadingButton
        loading={isCreatingOgImageField}
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
