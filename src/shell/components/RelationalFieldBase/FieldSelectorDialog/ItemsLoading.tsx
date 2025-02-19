import { Stack, Skeleton, Checkbox } from "@mui/material";

type ItemsLoadingProps = {};
export const ItemsLoading = ({}: ItemsLoadingProps) => {
  return (
    <Stack borderRadius={2} border={1} borderColor="border" overflow="hidden">
      {Array.from({ length: 10 }).map((_, index) => (
        <Stack
          key={index}
          direction="row"
          sx={{
            bgcolor: "background.paper",
            height: 58,
            width: "100%",
            borderBottom: index + 1 < 10 ? 1 : 0,
            borderColor: "border",
            alignItems: "center",
          }}
        >
          <Stack direction="row" alignItems="center" flexGrow={1}>
            <Checkbox disabled sx={{ width: 56 }} />
            <Skeleton variant="rounded" width={40} height={40} />
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
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};
