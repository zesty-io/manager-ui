import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { DnDProvider } from "../components/DnDProvider";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";
import { MediaList } from "../components/MediaList";
import { Header } from "../components/Header";
import { NotFoundState } from "../components/NotFoundState";
import { NoResultsState } from "../components/NoResultsState";
import { File } from "../../../../../shell/services/types";
import { UploadModal } from "../components/UploadModal";
import Controls from "../components/Controls";
import { useMemo } from "react";
import { AppState } from "../../../../../shell/store/types";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
} from "../utils/fileUtils";
import { State } from "../../../../../shell/store/media-revamp";

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const AllMedia = ({ addImagesCallback }: Props) => {
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
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
  );
  const defaultBin = bins?.find((bin) => bin.default);
  const { data: unsortedFiles, isFetching: isFilesFetching } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );
  const sortedFiles = useMemo(() => {
    if (!unsortedFiles) return unsortedFiles;
    switch (sortOrder) {
      case "alphaAsc":
        return [...unsortedFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "alphaDesc":
        return [...unsortedFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "createdDesc":
        return [...unsortedFiles].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      // Default to API order
      default:
        return unsortedFiles;
    }
  }, [unsortedFiles, sortOrder]);

  const files = useMemo(() => {
    if (!sortedFiles) return sortedFiles;
    if (filetypeFilter && dateRangeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedFiles.filter((file) => {
        return (
          extensions.has(fileExtension(file.filename)) &&
          dateFilterFn(file.created_at)
        );
      });
    } else if (filetypeFilter) {
      const extensions = new Set<string>(getExtensions(filetypeFilter));
      return sortedFiles.filter((file) => {
        return extensions.has(fileExtension(file.filename));
      });
    } else if (dateRangeFilter) {
      const dateFilterFn = getDateFilterFn(dateRangeFilter);
      return sortedFiles.filter((file) => {
        return dateFilterFn(file.created_at);
      });
    } else {
      return sortedFiles;
    }
  }, [sortedFiles, filetypeFilter, dateRangeFilter]);

  const MediaView = () => {
    return (
      <>
        {currentMediaView === "grid" ? (
          <MediaGrid files={files} hideHeaders />
        ) : (
          <MediaList files={files} />
        )}
      </>
    );
  };

  return (
    <Box
      component="main"
      sx={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Header
        title="All Media"
        addImagesCallback={addImagesCallback}
        binId={defaultBin?.id}
        hideFolderCreate
        files={files}
      />
      {isFilesFetching || isBinsFetching ? (
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
          <DnDProvider
            isDefaultBin
            currentBinId={defaultBin?.id}
            currentGroupId=""
          >
            {!isFilesFetching && !isBinsFetching && !files?.length ? (
              <>
                {unsortedFiles.length ? (
                  <NoResultsState filetype={filetypeFilter} />
                ) : (
                  <EmptyState currentBinId={defaultBin?.id} currentGroupId="" />
                )}
              </>
            ) : (
              <MediaView />
            )}
          </DnDProvider>
        </>
      )}
    </Box>
  );
};
