import { Box, Typography, Button, SvgIcon } from "@mui/material";
import {
  useGetContentModelFieldsQuery,
  useGetContentModelsQuery,
} from "../../../../../../shell/services/instance";
import { useHistory, useParams } from "react-router";
import { modelIconMap } from "../../utils";

type Params = {
  id: string;
};

export const RelatedModels = () => {
  const params = useParams<Params>();
  const { id } = params;
  const history = useHistory();
  const { data: fields } = useGetContentModelFieldsQuery(id);
  const { data: models } = useGetContentModelsQuery();
  const relatedModelsZUIDs = fields
    ?.filter(
      (field) =>
        field.datatype === "one_to_one" || field.datatype === "one_to_many"
    )
    ?.map((field) => field.relatedModelZUID);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600}>
        Related Models
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        View the models, this model is connected to
      </Typography>
      <Box
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        sx={{ backgroundColor: "background.paper" }}
      >
        {relatedModelsZUIDs?.map((modelZUID, index) => {
          const model = models?.find((model) => model.ZUID === modelZUID);
          return (
            <Box
              display="flex"
              alignItems="center"
              p={2}
              sx={{
                borderBottom:
                  index + 1 < relatedModelsZUIDs?.length ? "1px solid" : "none",
                borderColor: "border",
              }}
            >
              <Box display="flex" flex={1} gap={1.5} alignItems="center">
                <SvgIcon color="action" component={modelIconMap[model?.type]} />
                <Typography>{model?.label}</Typography>
              </Box>
              <Button
                size="small"
                onClick={() => history.push(`/schema/${model?.ZUID}`)}
              >
                View
              </Button>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
