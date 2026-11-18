import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { useHistory, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { ContentItem } from "../../../../../../../../shell/services/types";
import {
  useDeleteContentItemMutation,
  useGetContentModelItemsQuery,
} from "../../../../../../../../shell/services/instance";
import { ConfirmDialog } from "../../../../../../../../shell/components/ConfirmDialog";
import { useTranslation } from "react-i18next";

type DuplicateItemProps = {
  onClose: () => void;
};

export const DeleteItemDialog = ({ onClose }: DuplicateItemProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const history = useHistory();
  const item = useSelector(
    (state: AppState) => state.content[itemZUID] as ContentItem
  );
  const { data: modelItems } = useGetContentModelItemsQuery(
    { modelZUID },
    { skip: !modelZUID }
  );

  const [deleteContentItem] = useDeleteContentItemMutation();

  // Keep the last known title: REMOVE_ITEM drops the item from the store
  // before the dialog has unmounted.
  const currentTitle = item?.web?.metaTitle || item?.web?.metaLinkText;
  const [title, setTitle] = useState(currentTitle);
  useEffect(() => {
    if (currentTitle) setTitle(currentTitle);
  }, [currentTitle]);

  const getRedirectTarget = () => {
    if (history.location.pathname.includes("blocks")) {
      return modelItems?.length - 1 <= 0 ? "/blocks" : `/blocks/${modelZUID}`;
    }
    return `/content/${modelZUID}`;
  };

  const handleDelete = async () => {
    // Resolve before the request: the delete invalidates modelItems.
    const target = getRedirectTarget();

    await deleteContentItem({
      modelZUID: modelZUID,
      itemZUID: itemZUID,
    }).unwrap();

    /**
     * Remove the item from the store before redirecting
     */
    dispatch({
      type: "REMOVE_ITEM",
      itemZUID,
    });
    history.push(target);
  };

  return (
    <ConfirmDialog
      onClose={onClose}
      onConfirm={handleDelete}
      confirmDataCy="DeleteContentItemConfirmButton"
      confirmLabel={t("content.itemEditDeleteItem")}
      title={
        <>
          {t("content.itemEditDeleteContentItemTitle")}
          {":"}
          <Typography variant="inherit" fontWeight={600} display="block">
            {title}
          </Typography>
        </>
      }
      description={t("content.itemEditDeleteContentItemDescription")}
    />
  );
};
