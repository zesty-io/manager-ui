import { GridRenderCellParams } from "@mui/x-data-grid-pro";
import { Box, Stack } from "@mui/material";
import { ImageRounded } from "@mui/icons-material";

import { FileTypePreview } from "../../../../../../media/src/app/components/FileModal/FileTypePreview";
import { useGetFileQuery } from "../../../../../../../shell/services/mediaManager";

type ImageCellProps = { params: GridRenderCellParams };
export const ImageCell = ({ params }: ImageCellProps) => {
  const isFileZUID = !!params.value?.startsWith("3-");

  const { data, isFetching } = useGetFileQuery(params.value, {
    skip: !isFileZUID,
  });

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
    if (isFetching) {
      // TODO: Add skeleton loader
      return <></>;
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
          src={data?.url}
          filename={data?.filename}
          updatedAt={data?.updated_at}
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
