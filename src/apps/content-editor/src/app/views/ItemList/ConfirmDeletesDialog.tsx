import { List } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ContentItem } from "../../../../../../shell/services/types";
import { ConfirmDialog } from "../../../../../../shell/components/ConfirmDialog";
import { DialogContentItem } from "./DialogContentItem";

type ConfirmDeletesModalProps = {
  items: ContentItem[];
  onConfirm: (items: ContentItem[]) => Promise<unknown>;
  onCancel: () => void;
};
export const ConfirmDeletesDialog = ({
  items,
  onConfirm,
  onCancel,
}: ConfirmDeletesModalProps) => {
  const { t } = useTranslation();
  // Snapshot on open: the caller clears the selection on success, and the
  // title and count must not drop to 0 while the dialog closes.
  const [snapshot] = useState(items);

  return (
    <ConfirmDialog
      dialogDataCy="ConfirmDeletesDialog"
      width={480}
      confirmDataCy="ConfirmMultiPageTableDelete"
      onConfirm={() => onConfirm(snapshot)}
      onClose={onCancel}
      title={
        <>
          {t("content.itemListDeleteTitle", { count: snapshot.length })}
          {":"}
        </>
      }
      description={t("content.itemListDeleteDescription", {
        count: snapshot.length,
      })}
      confirmLabel={t("content.itemListDeleteButton", {
        count: snapshot.length,
      })}
    >
      <List disablePadding sx={{ mt: 1 }}>
        {snapshot.map((item, index) => (
          <DialogContentItem key={index} item={item} />
        ))}
      </List>
    </ConfirmDialog>
  );
};
