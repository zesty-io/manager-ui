import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
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
                height: "32px",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: 0,
                },
              }}
              inputRef={searchRef}
              InputProps={{
                sx: {
                  backgroundColor: "grey.50",
                },
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
              onClick={() => setShowCreateModelDialogue(true)}
              data-cy="create-model-button-all-models"
            >
              Create Model
            </Button>
          </Box>
        </Box>
        <Box height="100%" px={3} pt={2}>
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
