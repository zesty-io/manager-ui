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

export const BinMedia = ({ addImagesCallback }: Props) => {
  const instanceId = useSelector((state: AppState) => state.instance.ID);
  const ecoId = useSelector((state: AppState) => state.instance.ecoID);
  const sortOrder = useSelector(
    (state: AppState) => state.mediaRevamp.sortOrder
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

  const binFiles = useMemo(() => {
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

  const binGroups = useMemo(() => {
    if (!unsortedBinGroups) return unsortedBinGroups;
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
        Bins do not have a created_at field so they cannot be sorted by
        creation time
      */
      case "createdDesc":
      // Default to API order
      default:
        return unsortedBinGroups;
    }
  }, [unsortedBinGroups, sortOrder, binData]);
  console.log({ unsortedBinFiles, unsortedBinGroups, binFiles, binGroups });

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
              <UploadModal />
              {/* /* TODO FIX THIS */}
              <DnDProvider currentBinId={id} currentGroupId="">
                {!isFilesFetching && !binFiles?.length && !binGroups?.length ? (
                  /*TODO fix this*/
                  <EmptyState currentBinId={id} currentGroupId="" />
                ) : (
                  <MediaGrid files={binFiles} groups={binGroups} />
                )}
              </DnDProvider>
            </>
          )}
        </>
      )}
    </Box>
  );
};
