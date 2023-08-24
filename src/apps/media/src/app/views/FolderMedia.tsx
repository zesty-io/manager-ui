import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { useParams as useSearchParams } from "../../../../../shell/hooks/useParams";
import { EmptyState } from "../components/EmptyState";
import {
  mediaManagerApi,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { MediaGrid } from "../components/MediaGrid";
import { MediaList } from "../components/MediaList";
import { useSelector } from "react-redux";
import { DnDProvider } from "../components/DnDProvider";
import { Header } from "../components/Header";
import { UploadModal } from "../components/UploadModal";
import { Box, CircularProgress, Typography } from "@mui/material";
import { NotFoundState } from "../components/NotFoundState";
import { File } from "../../../../../shell/services/types";
import { AppState } from "../../../../../shell/store/types";
import Controls from "../components/Controls";
import { NoResultsState } from "../components/NoResultsState";
import {
  MediaSortOrder,
  DateRange,
  Filetype,
} from "../../../../../shell/store/media-revamp";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
  getDateFilter,
} from "../utils/fileUtils";
import { State } from "../../../../../shell/store/media-revamp";

type Params = { id: string };

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
  setCurrentFilesCallback: (files: File[]) => void;
}

export const FolderMedia = ({
  addImagesCallback,
  setCurrentFilesCallback,
}: Props) => {
  const { id } = useParams<Params>();
  const [params, setParams] = useSearchParams();
  const sortOrder = params.get("sort");
  const filetypeFilter = params.get("filetype") as Filetype;
  const dateRangeFilter = getDateFilter(params);
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
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
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
      case "AtoZ":
        return [...unsortedGroupFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "ZtoA":
        return [...unsortedGroupFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "dateadded":
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
    if (filetypeFilter === "Folder") return [];
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
    if (Boolean(filetypeFilter) && filetypeFilter !== "Folder") return [];
    if (Boolean(dateRangeFilter)) return [];
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

  useEffect(() => {
    setCurrentFilesCallback(groupFiles || []);
  }, [groupFiles]);

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "grey.50",
      }}
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
              {(filetypeFilter || dateRangeFilter) && groupFiles?.length > 0 && (
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ pl: 3, pt: 2, pb: 1.5 }}
                >
                  {groupFiles?.length} matches found
                </Typography>
              )}
              <UploadModal />
              <DnDProvider
                currentBinId={groupData?.bin_id}
                currentGroupId={groupData?.id}
              >
                {!isFetching && !groupFiles?.length && !subgroups?.length ? (
                  <>
                    {unsortedGroupFiles?.length ? (
                      <NoResultsState filetype={filetypeFilter} />
                    ) : (
                      <EmptyState
                        currentBinId={groupData?.bin_id}
                        currentGroupId={groupData?.id}
                      />
                    )}
                  </>
                ) : currentMediaView === "grid" ? (
                  <MediaGrid files={groupFiles} groups={subgroups} />
                ) : (
                  <MediaList files={groupFiles} groups={subgroups} />
                )}
              </DnDProvider>
            </>
          )}
        </>
      )}
    </Box>
  );
};
