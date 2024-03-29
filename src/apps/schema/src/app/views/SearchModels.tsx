import { Box, Typography, IconButton, Stack } from "@mui/material";
import { ModelsTable } from "../components/ModelsTable";
import { useParams } from "../../../../../shell/hooks/useParams";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import { useHistory } from "react-router";

export const SearchModels = () => {
  const [params, setParams] = useParams();
  const history = useHistory();

  const search = params.get("term") || "";

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      sx={{ backgroundColor: "grey.50" }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={1.5}
        px={4}
        pt={4}
        pb={1.75}
        minHeight={84}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <IconButton size="small" onClick={() => history.push("/schema")}>
          <KeyboardBackspaceRoundedIcon fontSize="small" color="action" />
        </IconButton>
        <Typography variant="h3" fontWeight="700">
          {search}
        </Typography>
      </Stack>
      <Box height="100%" px={4} pt={2}>
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
