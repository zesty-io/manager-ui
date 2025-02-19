import { Stack, Skeleton, IconButton } from "@mui/material";
import { DragIndicatorRounded, Edit, MoreHoriz } from "@mui/icons-material";

type ActiveItemLoadingProps = {
  draggable?: boolean;
};
export const ActiveItemLoading = ({ draggable }: ActiveItemLoadingProps) => {
  return (
    <Stack
      direction="row"
      sx={{
        bgcolor: "background.paper",
        height: 62,
        width: "100%",
        border: 1,
        borderColor: "border",
        borderRadius: 2,
        alignItems: "center",
      }}
    >
      <Stack direction="row" alignItems="center" flexGrow={1}>
        {draggable && (
          <IconButton size="xsmall" sx={{ cursor: "grab", mx: 0.25 }} disabled>
            <DragIndicatorRounded fontSize="small" />
          </IconButton>
        )}
        <Skeleton
          variant="rounded"
          width={40}
          height={40}
          sx={{ ml: !draggable ? 2 : 0 }}
        />
        <Stack gap={0.5} justifyContent="center" flexGrow={1} ml={2}>
          <Skeleton
            variant="rounded"
            height={10}
            sx={{ width: "100%", maxWidth: 180 }}
          />
          <Skeleton
            variant="rounded"
            height={10}
            sx={{ width: "100%", maxWidth: 400 }}
          />
        </Stack>
      </Stack>
      <Stack direction="row" gap={2} mr={2} alignItems="center">
        <Stack gap={0.25}>
          <Stack
            height={20}
            width={28}
            bgcolor="grey.100"
            alignItems="center"
            justifyContent="center"
            borderRadius={1}
          >
            <Skeleton variant="rounded" height={10} width={20} />
          </Stack>
          <Stack
            height={20}
            width={28}
            bgcolor="grey.100"
            alignItems="center"
            justifyContent="center"
            borderRadius={1}
          >
            <Skeleton variant="rounded" height={10} width={20} />
          </Stack>
        </Stack>
        <Stack direction="row" gap={1}>
          <IconButton disabled size="xsmall">
            <Edit fontSize="small" />
          </IconButton>
          <IconButton disabled size="xsmall">
            <MoreHoriz fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Stack>
  );
};
