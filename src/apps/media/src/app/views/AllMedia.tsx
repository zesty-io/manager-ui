import { useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";
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
import { useEffect, useMemo, useState } from "react";
import { AppState } from "../../../../../shell/store/types";
import {
  fileExtension,
  getExtensions,
  getDateFilterFn,
  getDateFilter,
} from "../utils/fileUtils";
import { Filetype } from "../../../../../shell/store/media-revamp";
import { useParams as useSearchParams } from "../../../../../shell/hooks/useParams";
import { State } from "../../../../../shell/store/media-revamp";

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
  setCurrentFilesCallback: (files: File[]) => void;
}

export const AllMedia = ({
  addImagesCallback,
  setCurrentFilesCallback,
}: Props) => {
  const [params, setParams] = useSearchParams();
  const sortOrder = params.get("sort");
  const filetypeFilter = params.get("filetype") as Filetype;
  const dateRangeFilter = getDateFilter(params);
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const currentMediaView = useSelector(
    (state: { mediaRevamp: State }) => state.mediaRevamp.currentMediaView
  );
  const defaultBin = bins?.find((bin) => bin.default) || bins?.[0];
  const { data: unsortedFiles, isFetching: isFilesFetching } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );
  const sortedFiles = useMemo(() => {
    if (!unsortedFiles) return unsortedFiles;
    switch (sortOrder) {
      case "AtoZ":
        return [...unsortedFiles].sort((a, b) => {
          return a.filename.localeCompare(b.filename);
        });
      case "ZtoA":
        return [...unsortedFiles].sort((a, b) => {
          return b.filename.localeCompare(a.filename);
        });
      case "dateadded":
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
    if (filetypeFilter === "Folder") return [];
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

  useEffect(() => {
    setCurrentFilesCallback(files || []);
  }, [files]);

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
      <Header
        title="Recents"
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
          <Controls />
          {(filetypeFilter || dateRangeFilter) && files?.length > 0 && (
            <Typography
              color="text.secondary"
              variant="h6"
              sx={{ pl: 3, pt: 2, pb: 1.5 }}
            >
              {files?.length} matches found
            </Typography>
          )}
          <DnDProvider
            isDefaultBin
            currentBinId={defaultBin?.id}
            currentGroupId=""
          >
            {!isFilesFetching && !isBinsFetching && !files?.length ? (
              <>
                {unsortedFiles?.length ? (
                  <NoResultsState filetype={filetypeFilter} />
                ) : (
                  <EmptyState currentBinId={defaultBin?.id} currentGroupId="" />
                )}
              </>
            ) : currentMediaView === "grid" ? (
              <MediaGrid files={files} hideHeaders />
            ) : (
              <MediaList files={files} />
            )}
          </DnDProvider>
        </>
      )}
    </Box>
  );
};
