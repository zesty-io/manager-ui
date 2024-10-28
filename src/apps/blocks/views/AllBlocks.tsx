import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  CircularProgress,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useState, useRef } from "react";
import { CreateModelDialogue } from "../../schema/src/app/components/CreateModelDialogue";
import { BlockCard } from "../components/BlockCard";
import { useGetContentModelsQuery } from "../../../shell/services/instance";
import { NoResults } from "../../schema/src/app/components/NoResults";

export const AllBlocks = () => {
  const [search, setSearch] = useState("");
  const { data: models, isFetching } = useGetContentModelsQuery();
  const [showCreateModelDialogue, setShowCreateModelDialogue] = useState(false);
  const searchRef = useRef(null);

  const filteredModels = models?.filter(
    (model) =>
      model.type === "block" &&
      model.label?.toLowerCase().includes(search.toLowerCase())
  );

  if (isFetching) {
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
  }

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
            All Blocks
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
              placeholder="Search Blocks"
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddRoundedIcon />}
              onClick={() => setShowCreateModelDialogue(true)}
            >
              Create Block
            </Button>
          </Stack>
        </Box>
        {!filteredModels?.length && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            px={7}
          >
            {!search && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap={6}
              >
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    Start By Creating Blocks
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={1}
                    mb={2}
                  >
                    Block models define the structure of a block such as a hero,
                    feature, testimonial, etc.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setShowCreateModelDialogue(true)}
                  >
                    Create Block
                  </Button>
                </Box>
                <Box>
                  <Box component="img" width={522} height={326}></Box>
                </Box>
              </Box>
            )}
            {search && (
              <NoResults
                type="search"
                searchTerm={search}
                onButtonClick={() => searchRef.current.focus()}
              />
            )}
          </Box>
        )}
        {filteredModels?.length && (
          <Box height="100%" px={4} py={2} overflow="auto">
            <Box display="flex" gap={2} flexWrap="wrap">
              {filteredModels
                ?.sort((a, b) => a.label.localeCompare(b.label))
                .map((model) => (
                  <Box key={model.ZUID} width={265}>
                    <BlockCard model={model} />
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
      {showCreateModelDialogue && (
        <CreateModelDialogue
          onClose={() => setShowCreateModelDialogue(false)}
        />
      )}
    </>
  );
};
