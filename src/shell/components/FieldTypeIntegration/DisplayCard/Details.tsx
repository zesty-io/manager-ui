import { Typography, Stack, Skeleton } from "@mui/material";
import { Box } from "@mui/material";
import { getKeyValue } from "../utils";
import { IntegrationTypes } from "../../../services/types";

type DetailsProps = {
  subHeading?: string;
  data?: any[];
  listItems?: string[];
  loading: boolean;
  type: IntegrationTypes;
};

const DetailsSkeleton = ({ type }: { type: IntegrationTypes }) => {
  if (type !== "details") {
    return <Skeleton animation="wave" height="20px" width="90%" />;
  }

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

const Details = ({
  subHeading,
  data,
  listItems,
  loading = false,
  type = "details",
}: DetailsProps) => {
  if (loading) return <DetailsSkeleton type={type} />;
  if (type === "simple") return null;
  if (type !== "details") {
    return (
      <Typography
        variant="body2"
        fontWeight={400}
        color="text.secondary"
        noWrap
        textOverflow="ellipsis"
        width="100%"
      >
        {subHeading || "Add Sub-heading"}
      </Typography>
    );
  }
  if (!listItems?.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        + Add Detail
      </Typography>
    );
  }
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="space-between"
    >
      {listItems.map((item, i) => {
        const itemValue = getKeyValue(data, item);

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
              {item || `+ Add Detail`}
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
      })}
    </Box>
  );
};

export default Details;
