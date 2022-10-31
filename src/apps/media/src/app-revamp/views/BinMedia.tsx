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

type Params = { id: string };

interface Props {
  addImagesCallback?: (selectedFiles: File[]) => void;
}

export const BinMedia = ({ addImagesCallback }: Props) => {
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
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

  const { data: binGroups, isFetching: isGroupsFetching } =
    mediaManagerApi.useGetBinGroupsQuery(id, {
      skip: !isValidId,
    });

  const { data: binFiles, isFetching: isFilesFetching } =
    mediaManagerApi.useGetBinFilesQuery(id, {
      skip: !isValidId,
    });

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
              <UploadModal />
              {/* /* TODO FIX THIS */}
              <DnDProvider currentBinId={id} currentGroupId="">
                {!isFilesFetching && !binFiles?.length && !binGroups?.length ? (
                  /*TODO fix this*/
                  <EmptyState currentBinId={id} currentGroupId="" />
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
