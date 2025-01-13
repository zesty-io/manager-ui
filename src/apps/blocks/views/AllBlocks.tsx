import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Stack,
  CircularProgress,
  Link,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StreetViewRoundedIcon from "@mui/icons-material/StreetviewRounded";
import { useState, useRef } from "react";
import { CreateModelDialogue } from "../../schema/src/app/components/CreateModelDialogue";
import { BlockCard } from "../components/BlockCard";
import { useGetContentModelsQuery } from "../../../shell/services/instance";
import { NoResults } from "../../schema/src/app/components/NoResults";
import allBlocksEmpty from "../../../../public/images/allBlocksEmpty.png";
import { OnboardingDialog } from "../components/OnboardingDialog";
import { useLocalStorage } from "react-use";

export const AllBlocks = () => {
  const [search, setSearch] = useState("");
  const { data: models, isFetching } = useGetContentModelsQuery();
  const [showCreateModelDialogue, setShowCreateModelDialogue] = useState(false);
  const searchRef = useRef(null);
  const [showOnboardingDialog, setShowOnboardingDialog] = useLocalStorage(
    "zesty:blocks:onboarding",
    true
  );

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
              data-cy="search-blocks-input"
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
              data-cy="create-block-button"
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
                pt={2}
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
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => setShowCreateModelDialogue(true)}
                    >
                      Create Block
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<StreetViewRoundedIcon />}
                      onClick={() => setShowOnboardingDialog(true)}
                    >
                      Take Product Tour
                    </Button>
                  </Box>
                  <Typography
                    variant="overline"
                    mt={3}
                    mb={2}
                    sx={{
                      display: "block",
                      borderBottom: (theme) =>
                        `1px solid ${theme.palette.grey[200]}`,
                    }}
                  >
                    Documentation
                  </Typography>
                  <Box
                    component="ul"
                    color="info.dark"
                    sx={{
                      fontSize: "14px",
                      listStylePosition: "inside",
                    }}
                  >
                    <li>
                      <Link color="secondary">How to Create a Block</Link>
                    </li>
                    <li>
                      <Link color="secondary">How to use Blocks</Link>
                    </li>
                    <li>
                      <Link color="secondary">
                        Introduction to Web Components
                      </Link>
                    </li>
                  </Box>
                </Box>
                <Box>
                  <Box component="img" src={allBlocksEmpty}></Box>
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
          modelType="block"
          onClose={() => setShowCreateModelDialogue(false)}
        />
      )}
      {showOnboardingDialog && (
        <OnboardingDialog onClose={() => setShowOnboardingDialog(false)} />
      )}
    </>
  );
};
