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
import { useState, useEffect, useRef } from "react";

export const AllModels = () => {
  const [search, setSearch] = useState("");
  const [focusSearch, setFocusSearch] = useState(false);
  const searchRef = useRef(null);

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
            inputRef={searchRef}
            sx={{
              backgroundColor: "grey.50",
              "& .Mui-focused": {
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "primary.main",
              },
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
        <ModelsTable
          search={search}
          onEmptySearch={() => searchRef?.current?.focus()}
        />
      </Box>
    </Box>
  );
};
