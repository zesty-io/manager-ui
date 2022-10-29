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
import { File } from "../../../../../shell/services/types";
import { UploadModal } from "../components/UploadModal";

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const AllMedia = ({ addImagesCallback }: Props) => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const { data: bins, isFetching: isBinsFetching } = useGetBinsQuery({
    instanceId,
    ecoId,
  });
  const defaultBin = bins?.find((bin) => bin.default);
  const { data: files, isFetching: isFilesFetching } = useGetAllBinFilesQuery(
    bins?.map((bin) => bin.id),
    { skip: !bins?.length }
  );

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
          <UploadModal />
          <DnDProvider
            isDefaultBin
            currentBinId={defaultBin?.id}
            currentGroupId=""
          >
            {!isFilesFetching && !isBinsFetching && !files?.length ? (
              <EmptyState currentBinId={defaultBin?.id} currentGroupId="" />
            ) : (
              <MediaGrid files={files} hideHeaders />
            )}
          </DnDProvider>
        </>
      )}
    </Box>
  );
};
