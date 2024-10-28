import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  useGetContentModelItemsQuery,
  useGetContentModelsQuery,
} from "../../../shell/services/instance";
import emptyItemsList from "../../../../public/images/emptyItemsList.png";

export const BlockModel = () => {
  const { modelZUID } = useParams<{
    modelZUID: string;
  }>();
  const history = useHistory();
  const [renderFlag, setRenderFlag] = useState(false);
  const { data, isFetching, error, isUninitialized } =
    useGetContentModelItemsQuery({
      modelZUID,
      params: {
        limit: 1,
      },
    });

  const { data: models } = useGetContentModelsQuery();

  useEffect(() => {
    if (data?.length && !isFetching && !error) {
      history.push(`/blocks/${modelZUID}/${data?.[0]?.meta?.ZUID}`);
    }

    if (!isFetching && !isUninitialized && !data?.length) {
      setRenderFlag(true);
    }
  }, [data, isFetching, error, history]);

  const model = models?.find((model) => model.ZUID === modelZUID);

  if (renderFlag) {
    return (
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        sx={{ backgroundColor: "grey.50" }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          px={4}
          pt={4}
          pb={1.75}
          sx={{
            borderBottom: (theme) => `2px solid ${theme.palette.border}`,
            backgroundColor: "background.paper",
          }}
        >
          <Typography variant="h3" fontWeight="700">
            {model?.label}
          </Typography>
        </Box>
        <Box
          display="flex"
          height="100%"
          alignItems="center"
          justifyContent="center"
          px={4}
          gap={6}
        >
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Start Creating Variants Now
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1} mb={2}>
              Add your variants here. Start by creating your first variant.
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => history.push(`/blocks/${modelZUID}/new`)}
            >
              Create Variant
            </Button>
          </Box>
          <Box>
            <img
              height={420}
              width={582}
              src={emptyItemsList}
              alt="Empty Items List"
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      <CircularProgress />
    </Box>
  );
};
