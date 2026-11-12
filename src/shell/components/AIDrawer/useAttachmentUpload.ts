import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  useCreateGroupMutation,
  useLazyGetBinGroupsQuery,
  useLazyGetBinsQuery,
  useUploadFileMutation,
} from "../../services/mediaManager";
import { Bin } from "../../services/types";
import { AppState } from "../../store/types";
import { PromptImage } from "./attachments";

// Prompt images land here, at the root of the instance's default bin, rather
// than among the site's own media at the bin root.
export const ATTACHMENTS_FOLDER_NAME = "AI Attachments";

// The folder's group id per bin, found or created once per session. A
// promise, so two sends at once do not both create it.
const folderIdByBin = new Map<string, Promise<string>>();

// Uploads one prompt image to the media library and resolves with its file
// ZUID and CDN URL.
export const useAttachmentUpload = () => {
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const userZUID = useSelector((state: AppState) => state.user.ZUID);
  const [getBins] = useLazyGetBinsQuery();
  const [getBinGroups] = useLazyGetBinGroupsQuery();
  const [createGroup] = useCreateGroupMutation();
  const [uploadFile] = useUploadFileMutation();

  const getFolderId = useCallback(
    (bin: Bin) => {
      const cached = folderIdByBin.get(bin.id);
      if (cached) return cached;

      const folderId = (async () => {
        const groups = await getBinGroups(bin.id).unwrap();
        const existing = groups?.find(
          (group) =>
            group.name === ATTACHMENTS_FOLDER_NAME && group.group_id === bin.id
        );
        if (existing) return existing.id;

        const created = await createGroup({
          body: {
            name: ATTACHMENTS_FOLDER_NAME,
            bin_id: bin.id,
            group_id: bin.id,
          },
        }).unwrap();
        return created.data[0].id;
      })();
      folderIdByBin.set(bin.id, folderId);
      // A failed lookup is retried on the next send.
      folderId.catch(() => folderIdByBin.delete(bin.id));
      return folderId;
    },
    [getBinGroups, createGroup]
  );

  return useCallback(
    async (file: File): Promise<PromptImage> => {
      const bins = await getBins({ instanceId, ecoId }, true).unwrap();
      // As the media app does, the first bin when none is marked default.
      const bin = bins?.find((bin) => bin.default) || bins?.[0];
      if (!bin) throw new Error("The instance has no media bin");

      const groupId = await getFolderId(bin);
      const [uploaded] = await uploadFile({
        bin,
        groupId,
        userZUID,
        file,
      })
        .unwrap()
        .catch((error) => {
          // The folder may have been deleted since it was cached, so the
          // next send looks it up again.
          folderIdByBin.delete(bin.id);
          throw error;
        });
      if (!uploaded?.id) throw new Error("The upload returned no file");

      return { fileZuid: uploaded.id, url: uploaded.url };
    },
    [getBins, getFolderId, uploadFile, instanceId, ecoId, userZUID]
  );
};
