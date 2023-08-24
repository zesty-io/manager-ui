import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
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
import { State } from "../../../../../shell/store/media-revamp";
import { NoResultsState } from "../components/NoResultsState";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
  getDateFilter,
} from "../utils/fileUtils";
import { Filetype } from "../../../../../shell/store/media-revamp";
import { useParams as useSearchParams } from "../../../../../shell/hooks/useParams";

type Params = { id: string };

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
  setCurrentFilesCallback: (files: File[]) => void;
}

export const BinMedia = ({
  addImagesCallback,
  setCurrentFilesCallback,
}: Props) => {
  const [params, setParams] = useSearchParams();
  const sortOrder = params.get("sort");
  const filetypeFilter = params.get("filetype") as Filetype;
  const dateRangeFilter = getDateFilter(params);
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const { id } = useParams<Params>();
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
  );
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
      case "AtoZ":
        return [...unsortedBinFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "ZtoA":
        return [...unsortedBinFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "dateadded":
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
    if (filetypeFilter === "Folder") return [];
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
    if (Boolean(filetypeFilter) && filetypeFilter !== "Folder") return [];
    if (Boolean(dateRangeFilter)) return [];
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

  useEffect(() => {
    setCurrentFilesCallback(binFiles || []);
  }, [binFiles]);

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
              <Controls />
              {(filetypeFilter || dateRangeFilter) && binFiles?.length > 0 && (
                <Typography
                  color="text.secondary"
                  variant="h6"
                  sx={{ pl: 3, pt: 2, pb: 1.5 }}
                >
                  {binFiles?.length} matches found
                </Typography>
              )}
              <UploadModal />
              <DnDProvider currentBinId={id} currentGroupId="">
                {!isFilesFetching && !binFiles?.length && !binGroups?.length ? (
                  <>
                    {unsortedBinFiles?.length ? (
                      <NoResultsState filetype={filetypeFilter} />
                    ) : (
                      <EmptyState currentBinId={id} currentGroupId="" />
                    )}
                  </>
                ) : currentMediaView === "grid" ? (
                  <MediaGrid
                    files={binFiles}
                    groups={binGroups?.filter((group) => group.group_id === id)}
                  />
                ) : (
                  <MediaList
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
