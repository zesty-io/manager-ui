import { Typography, Stack, Skeleton } from "@mui/material";
import { Box } from "@mui/material";
import { FC } from "react";
import { getKeyValue } from "../utils";

type DetailsProps = {
  data: any[];
  listItems: {
    label: string;
    path: string;
  }[];
  loading?: boolean;
};

const DetailsSkeleton = () => {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        my={0.5}
      >
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="75%"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          height="10px"
          width="50px"
        />
      </Stack>
    </>
  );
};

const Details: FC<DetailsProps> = ({ data, listItems, loading = false }) => {
  if (!listItems?.length)
    return (
      <Typography variant="body2" color="text.secondary">
        + Add Detail
      </Typography>
    );
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {loading ? (
        <DetailsSkeleton />
      ) : (
        listItems.map((item, i) => {
          const itemValue = getKeyValue(data, item?.path);

          return (
            <Box
              key={i}
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              <Typography
                variant="body2"
                color="text.primary"
                flexGrow={1}
                flexShrink={1}
                textOverflow="ellipsis"
                overflow="hidden"
                noWrap
                maxWidth="70%"
              >
                {item?.label || `+ Add Detail`}
              </Typography>
              {!!itemValue && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="right"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  noWrap
                  maxWidth="30%"
                  flexGrow={0}
                  flexShrink={0}
                >
                  {itemValue}
                </Typography>
              )}
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default Details;
