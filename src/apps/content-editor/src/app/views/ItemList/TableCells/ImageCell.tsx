import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Box, Skeleton, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useMemo } from "react";

import { FileTypePreview } from "../../../../../../media/src/app/components/FileModal/FileTypePreview";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../../../shell/store/types";

type ImageCellProps = { params: GridRenderCellParams };
export const ImageCell = ({ params }: ImageCellProps) => {
  const instance = useSelector((state: AppState) => state.instance);
  const isFileZUID = !!params.value?.startsWith("3-");

  const { data: bins, isFetching: isFetchingBins } = useGetBinsQuery({
    instanceId: instance?.ID,
    ecoId: instance?.ecoID,
  });

  // Query below will not necessarily be made on every render as this
  // is already performed on component load, we're simply accessing the cached data
  const { data: allMediaFiles, isFetching: isFetchingAllMediaFiles } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );

  const file = useMemo(() => {
    if (isFileZUID) {
      return allMediaFiles?.find((file) => file.id === params.value);
    }
  }, [allMediaFiles, params.value]);

  if (!params.value) {
    return (
      <Stack
        sx={{
          backgroundColor: "grey.100",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          zIndex: -1,
        }}
      >
        <ImageRounded fontSize="small" color="action" />
      </Stack>
    );
  }

  if (isFileZUID) {
    if (isFetchingAllMediaFiles || isFetchingBins) {
      return (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
        />
      );
    }

    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",

          "[data-cy='file-preview']": {
            width: "100%",
          },
        }}
      >
        <FileTypePreview
          isMediaThumbnail
          src={file?.url}
          filename={file?.filename}
          updatedAt={file?.updated_at}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",

        "[data-cy='file-preview']": {
          width: "100%",
        },
      }}
    >
      <FileTypePreview
        isMediaThumbnail
        src={params?.value}
        filename={params?.value?.split("/").pop()}
      />
    </Box>
  );
};
