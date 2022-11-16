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
import { NoResultsState } from "../components/NoResultsState";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
} from "../utils/fileUtils";

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
  const filetypeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.filetypeFilter
  );
  const dateRangeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.dateRangeFilter
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
  const sortedGroupFiles = useMemo(() => {
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

  const groupFiles = useMemo(() => {
    if (!sortedGroupFiles) return sortedGroupFiles;
    if (filetypeFilter && dateRangeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedGroupFiles.filter((file) => {
        return (
          extensions.has(fileExtension(file.filename)) &&
          dateFilterFn(file.created_at)
        );
      });
    } else if (filetypeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      return sortedGroupFiles.filter((file) => {
        return extensions.has(fileExtension(file.filename));
      });
    } else if (dateRangeFilter) {
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedGroupFiles.filter((file) => {
        return dateFilterFn(file.created_at);
      });
    } else {
      return sortedGroupFiles;
    }
  }, [sortedGroupFiles, filetypeFilter, dateRangeFilter]);

  const unsortedSubGroups = groupData?.groups;
  const subgroups = useMemo(() => {
    if (!unsortedSubGroups) return unsortedSubGroups;
    // don't show groups when filtering by filetypes or dates
    if (filetypeFilter !== null) return [];
    if (dateRangeFilter !== null) return [];
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
        Bins do not have a created_at field so we rely on the API to sort them
        by creation time
      */
      case "createdDesc":
      // Default to API order
      default:
        return unsortedSubGroups;
    }
  }, [unsortedSubGroups, sortOrder, filetypeFilter, dateRangeFilter]);

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
            files={groupFiles}
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
                  <>
                    {unsortedGroupFiles.length ? (
                      <NoResultsState filetype={filetypeFilter} />
                    ) : (
                      <EmptyState
                        currentBinId={groupData?.bin_id}
                        currentGroupId={groupData?.id}
                      />
                    )}
                  </>
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
