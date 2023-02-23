import { Box, Typography, Button, SvgIcon } from "@mui/material";
import { useGetContentModelsQuery } from "../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { modelIconMap } from "../../utils";

type Params = {
  id: string;
};

export const RelatedModels = () => {
  const params = useParams<Params>();
  const { id } = params;
  const history = useHistory();
  const { data: models } = useGetContentModelsQuery();
  const model = models?.find((model) => model.ZUID === id);
  const parentModel = models?.find(
    (modelI) => modelI.ZUID === model?.parentZUID
  );
  const relatedModels = models?.filter(
    (m) =>
      (m.parentZUID === parentModel?.ZUID || m.parentZUID === model.ZUID) &&
      m.ZUID !== model?.ZUID
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        Related Models
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        View the models, this model is connected to
      </Typography>
      {relatedModels?.map((model) => (
        <Box
          display="flex"
          alignItems="center"
          py={2}
          sx={{
            borderBottom: (theme) => `1px solid ${theme.palette.border}`,
          }}
        >
          <Box display="flex" flex={1} gap={1.5} alignItems="center">
            <SvgIcon color="action" component={modelIconMap[model.type]} />
            <Typography>{model.label}</Typography>
          </Box>
          <Button
            size="small"
            onClick={() => history.push(`/schema/${model?.ZUID}`)}
          >
            View
          </Button>
        </Box>
      ))}
    </Box>
  );
};