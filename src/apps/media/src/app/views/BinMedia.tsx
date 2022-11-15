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

export const BinMedia = ({ addImagesCallback }: Props) => {
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const sortOrder = useSelector(
    (state: AppState) => state.mediaRevamp.sortOrder
  );
  const filetypeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.filetypeFilter
  );
  const dateRangeFilter = useSelector(
    (state: AppState) => state.mediaRevamp.dateRangeFilter
  );
  const params = useParams<Params>();
  const { id } = params;
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const isValidId = bins?.some((bin) => bin.id === id);

  const { data: binData, isError } = mediaManagerApi.useGetBinQuery(id, {
    skip: !isValidId,
  });

  const { data: unsortedBinGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id, {
      skip: !isValidId,
    });

  const { data: unsortedBinFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id, {
      skip: !isValidId,
    });

  const sortedBinFiles = useMemo(() => {
    if (!unsortedBinFiles) return unsortedBinFiles;
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedBinFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "alphaDesc":
        return [...unsortedBinFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "createdDesc":
        return [...unsortedBinFiles].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      // Default to API order
      default:
        return unsortedBinFiles;
    }
  }, [unsortedBinFiles, sortOrder, binData, unsortedBinGroups]);

  const binFiles = useMemo(() => {
    if (!sortedBinFiles) return sortedBinFiles;
    if (filetypeFilter && dateRangeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedBinFiles.filter((file) => {
        return (
          extensions.has(fileExtension(file.filename)) &&
          dateFilterFn(file.created_at)
        );
      });
    } else if (filetypeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      return sortedBinFiles.filter((file) => {
        return extensions.has(fileExtension(file.filename));
      });
    } else if (dateRangeFilter) {
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedBinFiles.filter((file) => {
        return dateFilterFn(file.created_at);
      });
    } else {
      return sortedBinFiles;
    }
  }, [sortedBinFiles, filetypeFilter, dateRangeFilter]);

  const binGroups = useMemo(() => {
    if (!unsortedBinGroups) return unsortedBinGroups;
    // don't show groups when filtering by filetypes
    if (filetypeFilter !== null) return [];
    if (dateRangeFilter !== null) return [];
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedBinGroups].sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
      case "alphaDesc":
        return [...unsortedBinGroups].sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      /*
        Bins do not have a created_at field so we rely on the API to sort them
        by creation time
      */
      case "createdDesc":
      // Default to API order
      default:
        return unsortedBinGroups;
    }
  }, [unsortedBinGroups, sortOrder, binData, filetypeFilter, dateRangeFilter]);

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      {isError || (!isBinsFetching && !isValidId) ? (
        <NotFoundState />
      ) : (
        <>
          <Header
            title={binData?.[0]?.name}
            id={binData?.[0]?.id}
            binId={binData?.[0]?.id}
            files={binFiles}
            addImagesCallback={addImagesCallback}
          />
          {isGroupsFetching || isFilesFetching || isBinsFetching ? (
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
              <Controls showDateFilter={true} />
              <UploadModal />
              <DnDProvider currentBinId={id} currentGroupId="">
                {!isFilesFetching && !binFiles?.length && !binGroups?.length ? (
                  <>
                    {unsortedBinFiles.length ? (
                      <NoResultsState filetype={filetypeFilter} />
                    ) : (
                      <EmptyState currentBinId={id} currentGroupId="" />
                    )}
                  </>
                ) : (
                  <MediaGrid
                    files={binFiles}
                    groups={binGroups?.filter((group) => group.group_id === id)}
                  />
                )}
              </DnDProvider>
            </>
          )}
        </>
      )}
    </Box>
  );
};
