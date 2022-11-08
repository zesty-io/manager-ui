import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../shell/services/mediaManager";
import { DnDProvider } from "../components/DnDProvider";
import { EmptyState } from "../components/EmptyState";
import { MediaGrid } from "../components/MediaGrid";
import { Header } from "../components/Header";
import { NotFoundState } from "../components/NotFoundState";
import { NoResultsState } from "../components/NoResultsState";
import { File } from "../../../../../shell/services/types";
import { UploadModal } from "../components/UploadModal";
import Controls from "../components/Controls";
import { useMemo } from "react";
import { AppState } from "../../../../../shell/store/types";
import { fileExtension, getExtensions } from "../utils/fileUtils";

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
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
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
    if (!filetypeFilter) return sortedFiles;
    const extensions = new Set<string>(getExtensions(filetypeFilter));
    return sortedFiles.filter((file) =>
      extensions.has(fileExtension(file.filename))
    );
  }, [sortedFiles, filetypeFilter]);

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
      />
      {isFilesFetching || isBinsFetching ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
          data-cy="media-loading-spinner"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Controls />
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
              <MediaGrid files={files} hideHeaders />
            )}
          </DnDProvider>
        </>
      )}
    </Box>
  );
};
