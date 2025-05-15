import { Stack, Skeleton, Typography } from "@mui/material";

export const FieldsLoader = () => {
  return (
    <Stack gap={3}>
      <FieldSkeleton size="small" />
      <FieldSkeleton size="large" />
      <FieldSkeleton size="small" />
      <FieldSkeleton size="small" />
      <FieldSkeleton size="large" />
      <FieldSkeleton size="small" />
    </Stack>
  );
};

type FieldSkeletonProps = {
  size: "small" | "large";
};
const FieldSkeleton = ({ size }: FieldSkeletonProps) => {
  return (
    <Stack gap={0.5}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">
          <Skeleton variant="text" width={192} />
        </Typography>
        <Skeleton variant="circular" width={20} height={20} />
      </Stack>
      <Skeleton
        variant="rounded"
        width="100%"
        height={size === "large" ? 120 : 40}
      />
    </Stack>
  );
};
