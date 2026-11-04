import { useTranslation } from "react-i18next";
import {
  useDeleteGroupMutation,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { useHistory } from "react-router";
import { useSelector } from "react-redux";
import { ConfirmDialog } from "../../../../../shell/components/ConfirmDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  id: string;
  groupId: string;
}

export const DeleteFolderDialog = ({ open, onClose, id, groupId }: Props) => {
  const { t } = useTranslation();
  const [deleteGroup] = useDeleteGroupMutation();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const history = useHistory();

  const handleDelete = async () => {
    await deleteGroup({ id, groupId }).unwrap();
    if (bins?.length === 1) {
      history.push(`/media`);
    } else {
      history.push(`/media/folder/${groupId}`);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      title={t("media.deleteFolderDialogTitle")}
      description={t("media.deleteFolderDialogMessage")}
      confirmLabel={t("media.deleteFolderDialogConfirmButton")}
      confirmDataCy="DeleteFolderDialogConfirmButton"
    />
  );
};
