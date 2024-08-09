import { Button } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { AddRounded } from "@mui/icons-material";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { FieldShell } from "../../../../components/Editor/Field/FieldShell";
import { AppState } from "../../../../../../../../shell/store/types";
import { useCreateContentModelFieldMutation } from "../../../../../../../../shell/services/instance";
import { useEffect } from "react";
import { fetchItem } from "../../../../../../../../shell/store/content";

type MetaImageProps = {};
export const MetaImage = ({}: MetaImageProps) => {
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

  // If there is already a field named og_image
  // If there is any image field
  // If no image field

  const handleCreateOgImageField = () => {
    createContentModelField({
      modelZUID,
      body: {
        contentModelZUID: modelZUID,
        datatype: "images",
        description: "",
        label: "og_image",
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
