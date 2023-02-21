import { Box, Typography, IconButton } from "@mui/material";
import { ModelsTable } from "../components/ModelsTable";
import { useMemo } from "react";
import { useParams } from "../../../../../shell/hooks/useParams";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useHistory } from "react-router";
import { modelNameMap } from "../utils";

export const SearchModels = () => {
  const [params, setParams] = useParams();
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();

  const search = params.get("term") || "";

  const filteredModelsLength = useMemo(() => {
    return models?.filter((model: ContentModel) => {
      return (
        model?.label?.toLowerCase().includes(search.toLowerCase()) ||
        model?.name?.toLowerCase().includes(search.toLowerCase()) ||
        modelNameMap[model.type as keyof typeof modelNameMap]
          ?.toLowerCase()
          ?.includes(search.toLowerCase()) ||
        model.ZUID?.toLowerCase() === search.toLowerCase()
      );
    })?.length;
  }, [search, models]);

  return (
    <Box width="100%" display="flex" flexDirection="column">
      <Box
        display="flex"
        alignItems="center"
        gap={1.5}
        px={3}
        py={2}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.border}`,
        }}
      >
        <IconButton size="small" onClick={() => history.push("/schema")}>
          <CloseRoundedIcon fontSize="small" color="action" />
        </IconButton>
        <Typography variant="h6" fontWeight="600">
          {filteredModelsLength} Search Results for "{search}"
        </Typography>
      </Box>
      <Box height="100%" px={3} py={2}>
        <ModelsTable
          search={search}
          onEmptySearch={() => {
            document
              .querySelector<HTMLInputElement>(
                '[data-cy="SchemaSidebarSearch"]'
              )
              ?.focus();
          }}
        />
      </Box>
    </Box>
  );
};
