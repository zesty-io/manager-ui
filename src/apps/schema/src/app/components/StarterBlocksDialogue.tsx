import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  styled,
  CardActionArea,
  CardMedia,
  CardContent,
  alpha,
  Card,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import SearchIcon from "@mui/icons-material/Search";

import { StarterBlockForm } from "./StarterBlockForm";
import { NoResults } from "./NoResults";
import { StarterBlockProps, STARTER_BLOCKS } from "./configs";

type StarterBlocksDialogueProps = {
  onClose: () => void;
};

const CardStyles = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  border: "1px solid",
  borderColor: theme.palette.grey[100],
  boxShadow: "none",
  width: "100%",
  aspectRatio: "1/.8",
  backgroundColor: theme.palette.grey[100],
  position: "relative",
  "&.active": {
    outline: "2px solid",
    outlineColor: theme.palette.primary.main,
    outlineOffset: "-1px",
    "& .MuiCardContent-root": {
      backgroundColor: alpha(theme.palette.primary.light, 0.3),
      "& .card-content": {
        opacity: 0.8,
      },
    },
  },
}));

const BlockItem = ({
  block,
  isActive,
  onClick,
}: {
  block: StarterBlockProps;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <CardStyles className={isActive ? "active" : ""}>
      <CardActionArea
        onClick={onClick}
        sx={{ height: "100%", width: "100%" }}
        data-cy="starter-block-card"
      >
        <CardContent
          sx={{
            padding: 0,
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            flexGrow={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="card-content"
            sx={{
              borderWidth: (theme) => theme.spacing(1),
              borderColor: "transparent",
              borderStyle: "solid",
              overflow: "hidden",
            }}
          >
            <CardMedia component="img" image={block?.image} />
          </Box>
          <Typography
            className="card-content"
            flexGrow={0}
            height="52px"
            width="100%"
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-start"
            component="div"
            px={1.5}
            sx={{ backgroundColor: "background.paper" }}
          >
            {block?.label}
          </Typography>
        </CardContent>
      </CardActionArea>
    </CardStyles>
  );
};

export const StarterBlocksDialogue: React.FC<StarterBlocksDialogueProps> = ({
  onClose,
}) => {
  const searchRef = useRef<HTMLDivElement>();
  const [filteredBlockTypes, setFilteredBlockTypes] =
    useState<StarterBlockProps[]>(STARTER_BLOCKS);
  const [selectedBlockType, setSelectedBlockType] = useState(null);
  const [activeStep, setActiveStep] = useState<"selection" | "form">(
    "selection"
  );
  const [search, setSearch] = useState("");

  function handleBlockSelect(blockType: any) {
    setSelectedBlockType(blockType);
  }

  function handleSearchRetry() {
    setSearch("");
    searchRef.current?.focus();
  }

  const handleOpenForm = useCallback(() => {
    if (!!selectedBlockType) {
      setActiveStep("form");
    }
  }, [selectedBlockType]);

  useEffect(() => {
    if (!search) return setFilteredBlockTypes(STARTER_BLOCKS);
    const filtered = STARTER_BLOCKS.filter((block) => {
      const searchString = `${block.label.toLowerCase()}`;

      return searchString.includes(search.toLowerCase());
    });
    setFilteredBlockTypes(filtered);
  }, [search, STARTER_BLOCKS]);
  return (
    <>
      {activeStep === "selection" ? (
        <>
          <DialogTitle component="div">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box width={520}>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  Select a Block Type
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start with a blank block or select from our selection of pre
                  designed blocks
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <PlayCircleOutlineRoundedIcon color="info" />{" "}
                  <Link variant="body2" href="#" underline="always">
                    Learn Blocks basics with a tutorial
                  </Link>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => onClose()}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent
            data-cy="starter-blocks-selection-dialog"
            sx={{
              py: 2.5,
              backgroundColor: "grey.50",
              minHeight: "610px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "stretch",
              rowGap: 2,
            }}
            dividers
          >
            <Box sx={{ flexGrow: 0 }}>
              <TextField
                data-cy="starter-blocks-search"
                size="small"
                placeholder="Search variants"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                sx={{ width: { xs: "100%", sm: "100%", md: "60%", lg: "60%" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                inputRef={searchRef}
              />
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                position: "relative",
              }}
            >
              {!filteredBlockTypes?.length ? (
                <Box
                  data-cy="no-results-page"
                  width="100%"
                  height="100%"
                  display="grid"
                  position="absolute"
                  sx={{ placeContent: "center", minHeight: "100%" }}
                >
                  <NoResults
                    type="search"
                    onButtonClick={handleSearchRetry}
                    searchTerm={search}
                    sx={{
                      "& img": { height: "109px", width: "109px" },
                    }}
                  />
                </Box>
              ) : (
                <Grid
                  container
                  spacing={{ xs: 2, md: 2, lg: 2 }}
                  columns={{ xs: 4, sm: 8, md: 12 }}
                  sx={{
                    height: "100%",
                    width: "100%",
                  }}
                  data-cy="starter-blocks-container"
                >
                  {filteredBlockTypes?.map((block, index) => (
                    <Grid
                      key={block?.name}
                      item
                      xs={2}
                      sm={4}
                      md={4}
                      sx={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <BlockItem
                        block={block}
                        isActive={selectedBlockType?.name === block?.name}
                        onClick={() => handleBlockSelect(block)}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ pt: 2.5 }}>
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenForm}
              disabled={!selectedBlockType}
              data-cy="select-block-type-next-button"
            >
              Next
            </Button>
          </DialogActions>
        </>
      ) : activeStep === "form" ? (
        <StarterBlockForm
          block={selectedBlockType}
          onClose={onClose}
          setActiveStep={setActiveStep}
        />
      ) : null}
    </>
  );
};
