import { useMemo } from "react";
import { useParams } from "react-router";
import { EmptyState } from "../components/EmptyState";
import {
  mediaManagerApi,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { UploadModal } from "../components/UploadModal";
import { Box, CircularProgress } from "@mui/material";
import { NotFoundState } from "../components/NotFoundState";
import { File } from "../../../../../shell/services/types";
import { AppState } from "../../../../../shell/store/types";
import Controls from "../components/Controls";

type Params = { id: string };

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const FolderMedia = ({ addImagesCallback }: Props) => {
  const params = useParams<Params>();
  const { id } = params;
  const sortOrder = useSelector(
    (state: AppState) => state.mediaRevamp.sortOrder
  );
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const { data: binGroups, isFetching: isBinGroupsFetching } =
    mediaManagerApi.useGetAllBinGroupsQuery(
      bins?.map((bin) => bin.id),
      {
        skip: !bins?.length,
      }
    );
  const currentGroup = binGroups?.flat()?.find((group) => group.id === id);
  const {
    data: groupData,
    isFetching,
    isError,
  } = mediaManagerApi.useGetGroupDataQuery(id, {
    skip: !currentGroup,
  });

  const unsortedGroupFiles = groupData?.files;
  const groupFiles = useMemo(() => {
    if (!unsortedGroupFiles) return unsortedGroupFiles;
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedGroupFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "alphaDesc":
        return [...unsortedGroupFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "createdDesc":
        return [...unsortedGroupFiles].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      // Default to API order
      default:
        return unsortedGroupFiles;
    }
  }, [groupData, unsortedGroupFiles, sortOrder]);

  const unsortedSubGroups = groupData?.groups;
  const subgroups = useMemo(() => {
    if (!unsortedSubGroups) return unsortedSubGroups;
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedSubGroups].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      case "alphaDesc":
        return [...unsortedSubGroups].sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      /*
        Bins do not have a created_at field so they cannot be sorted by
        creation time
      */
      case "createdDesc":
      // Default to API order
      default:
        return unsortedSubGroups;
    }
  }, [unsortedSubGroups, sortOrder]);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isError || (!isBinsFetching && !isBinGroupsFetching && !currentGroup) ? (
        <NotFoundState />
      ) : (
        <>
          <Header
            title={currentGroup?.name || groupData?.name}
            id={currentGroup?.id || groupData?.id}
            binId={currentGroup?.bin_id || groupData?.bin_id}
            groupId={currentGroup?.group_id || groupData?.group_id}
            addImagesCallback={addImagesCallback}
          />
          {isBinsFetching || isBinGroupsFetching || isFetching ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Controls />
              <UploadModal />
              <DnDProvider
                currentBinId={groupData?.bin_id}
                currentGroupId={groupData?.id}
              >
                {!isFetching && !groupFiles?.length && !subgroups?.length ? (
                  <EmptyState
                    currentBinId={groupData?.bin_id}
                    currentGroupId={groupData?.id}
                  />
                ) : (
                  <MediaGrid files={groupFiles} groups={subgroups} />
                )}
              </DnDProvider>
            </>
          )}
        </>
      )}
    </Box>
  );
};
