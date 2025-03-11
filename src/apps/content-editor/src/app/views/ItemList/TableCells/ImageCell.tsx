import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Box, Skeleton, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";
import { useSelector } from "react-redux";

import { FileTypePreview } from "../../../../../../media/src/app/components/FileModal/FileTypePreview";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
  useLazyGetFileQuery,
} from "../../../../../../../shell/services/mediaManager";
import { AppState } from "../../../../../../../shell/store/types";
import { useEffect, useMemo, useState } from "react";
import { File } from "../../../../../../../shell/services/types";

type ImageCellProps = { params: GridRenderCellParams };
export const ImageCell = ({ params }: ImageCellProps) => {
  const [fileData, setFileData] = useState<File>(null);
  const instance = useSelector((state: AppState) => state.instance);
  const isFileZUID = !!params.value?.startsWith("3-");

  const { data: bins, isFetching: isFetchingBins } = useGetBinsQuery({
    instanceId: instance?.ID,
    ecoId: instance?.ecoID,
  });
  const [getFile] = useLazyGetFileQuery();

  // Query below will not necessarily be made on every render as this
  // is already performed on component load, we're simply accessing the cached data
  const { data: allMediaFiles, isFetching: isFetchingAllMediaFiles } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );
  useEffect(() => {
    if (isFetchingAllMediaFiles || !isFileZUID) return;

    const matchedFile = allMediaFiles?.find((file) => file.id === params.value);

    if (!matchedFile) {
      // If cache doesn't have the file data, attempt to look it up from the server
      getFile(params.value)
        .unwrap()
        .then((res) => {
          setFileData(res);
        })
        .catch((err: any) => {
          console.error(err);
        });
    } else {
      setFileData(matchedFile);
    }
  }, [allMediaFiles, params.value, isFetchingAllMediaFiles]);

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
          src={fileData?.url}
          filename={fileData?.filename}
          updatedAt={fileData?.updated_at}
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
