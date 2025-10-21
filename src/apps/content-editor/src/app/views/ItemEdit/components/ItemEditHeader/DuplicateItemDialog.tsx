import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Typography,
  Box,
} from "@mui/material";
import { ContentCopyRounded } from "@mui/icons-material";
import { useHistory, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import { AppState } from "../../../../../../../../shell/store/types";
import {
  ContentItem,
  Language,
} from "../../../../../../../../shell/services/types";
import {
  useCreateContentItemMutation,
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../../../../shell/services/instance";
import { notify } from "../../../../../../../../shell/store/notifications";
import { fetchItems } from "../../../../../../../../shell/store/content";

type DuplicateItemProps = {
  onClose: () => void;
};

export const DuplicateItemDialog = ({ onClose }: DuplicateItemProps) => {
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const { data: modelFields } = useGetContentModelFieldsQuery({
    modelZUID,
    showDeleted: false,
  });
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const languages = useSelector((state: AppState) => state.languages);
  const langCode =
    languages?.find((lang: Language) => lang?.ID === item?.meta?.langID)
      ?.code || languages?.find((lang: Language) => lang?.default)?.code;
  const { data: models, refetch: refetchContentModels } =
    useGetContentModelsQuery();

  const [createContentItem, { isLoading }] = useCreateContentItemMutation();

  const duplicateItem = () => {
    let fieldToChange;
    if (modelFields?.[0]?.datatype === "text") {
      fieldToChange = modelFields[0].name;
    }

    const uuidFieldKeys = modelFields
      ?.filter((field) => field.datatype === "uuid")
      ?.map((field) => field.name);

    const newData = { ...item.data };

    uuidFieldKeys?.forEach((key) => {
      newData[key] = null; // Set each uuid key to null
    });

    createContentItem({
      modelZUID,
      body: {
        data: {
          ...newData,
          ...(fieldToChange && {
            [fieldToChange]: item.data[fieldToChange] + " (copy)",
          }),
        },
        web: {
          canonicalTagMode: item.web.canonicalTagMode,
          parentZUID: item.web.parentZUID,
          metaLinkText: !item.web.metaLinkText
            ? null
            : item.web.metaLinkText?.slice(0, 143) + " (copy)",
          metaTitle: item.web.metaTitle?.slice(0, 143) + " (copy)",
          metaDescription: !item.web.metaDescription
            ? null
            : item.web.metaDescription?.slice(0, 153) + " (copy)",
          pathPart: item.web.pathPart
            ? item.web.pathPart + `-${new Date().toISOString()}`
            : undefined,
        },
        meta: {
          langID: item.meta.langID,
          contentModelZUID: item.meta.contentModelZUID,
        },
      },
    })
      .unwrap()
      .then((res) => {
        refetchContentModels();
        dispatch(fetchItems(modelZUID))
          //@ts-ignore
          .then((fetchItemsResponse: any) => {
            const createdItem = fetchItemsResponse?.data?.find(
              (item: ContentItem) => item?.meta?.ZUID === res.data.ZUID
            );
            const itemLangZUID =
              createdItem?.siblings?.[langCode] || res?.data?.ZUID;
            history.push(
              `/${
                models?.find((model) => model?.ZUID === modelZUID)?.type ===
                "block"
                  ? "blocks"
                  : "content"
              }/${modelZUID}/${itemLangZUID}`
            );
          });
        onClose();
      })
      .catch((error) => {
        console.error("Failed to duplicate item", error);
        dispatch(
          notify({
            message: "Failed to duplicate item.",
            kind: "error",
          })
        );
      });
  };

  return (
    <Dialog open fullWidth maxWidth={"xs"} onClose={onClose}>
      <DialogTitle component="div">
        <Box
          sx={{
            backgroundColor: "deepOrange.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ContentCopyRounded color="primary" />
        </Box>
        <Typography variant="h5" sx={{ mt: 1.5 }}>
          <Typography variant="inherit" display="inline" fontWeight={600}>
            Duplicate Content Item:
          </Typography>{" "}
          {item?.web?.metaTitle || item?.web?.metaLinkText}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This will create and save a copy of this item immediately.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => duplicateItem()}
          loading={isLoading}
        >
          Duplicate Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};
