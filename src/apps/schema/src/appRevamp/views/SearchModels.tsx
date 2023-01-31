import {
  Box,
  TextField,
  Typography,
  IconButton,
  Button,
  InputAdornment,
} from "@mui/material";
import { ModelsTable } from "../components/ModelsTable";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "../../../../../shell/hooks/useParams";
import { useGetContentModelsQuery } from "../../../../../shell/services/instance";
import { ContentModel } from "../../../../../shell/services/types";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useHistory } from "react-router";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

const modelNameMap = {
  templateset: "Multi Page",
  dataset: "Headless Dataset",
  pageset: "Single Page",
};

export const SearchModels = () => {
  const [params, setParams] = useParams();
  const { data: models } = useGetContentModelsQuery();
  const history = useHistory();

  const [search, setSearch] = useState("");

  useEffect(() => {
    setSearch(params.get("term"));
  }, [params.get("term")]);

  const filteredModelsLength = useMemo(() => {
    return models?.filter((model: ContentModel) => {
      return (
        model.label.toLowerCase().includes(search.toLowerCase()) ||
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        modelNameMap[model.type as keyof typeof modelNameMap]
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        model.ZUID.toLowerCase().includes(search.toLowerCase())
      );
    })?.length;
  }, [search, models]);

  return (
    <Box width="100%" display="flex" flexDirection="column">
      <Box
        display="flex"
        justifyContent="space-between"
        px={3}
        py={2}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.border}`,
        }}
      >
        <Typography variant="h4" fontWeight="600">
          All Models
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            sx={{
              backgroundColor: "grey.50",
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            placeholder="Search Models"
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
          >
            Create Model
          </Button>
        </Box>
      </Box>
      <Box height="100%" px={3} py={2}>
        <ModelsTable search={search} onEmptySearch={() => setSearch("")} />
      </Box>
    </Box>
  );
};
