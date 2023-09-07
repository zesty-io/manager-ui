import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { ModelsTable } from "../components/ModelsTable";
import { CreateModelDialogue } from "../components/CreateModelDialogue";
import { useState, useRef } from "react";
import { useLocation } from "react-router";

export const AllModels = () => {
  const [search, setSearch] = useState("");
  const location = useLocation();
  const triggerCreate = new URLSearchParams(location.search).get(
    "triggerCreate"
  );
  const [showCreateModelDialogue, setShowCreateModelDialogue] = useState(
    triggerCreate === "true" ? true : false
  );
  const searchRef = useRef(null);

  return (
    <>
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
            All Models
          </Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              sx={{
                width: "240px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
              }}
              inputRef={searchRef}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                  input: {
                    py: 0.75,
                  },
                },
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: 0.5 }}>
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
              onClick={() => setShowCreateModelDialogue(true)}
              data-cy="create-model-button-all-models"
            >
              Create Model
            </Button>
          </Stack>
        </Box>
        <Box height="100%" px={4} pt={2}>
          <ModelsTable
            search={search}
            onEmptySearch={() => searchRef?.current?.focus()}
          />
        </Box>
      </Box>
      {showCreateModelDialogue && (
        <CreateModelDialogue
          onClose={() => setShowCreateModelDialogue(false)}
        />
      )}
    </>
  );
};
