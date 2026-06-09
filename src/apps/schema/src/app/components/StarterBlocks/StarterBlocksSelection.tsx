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

import { useTranslation } from "react-i18next";

import { NoResults } from "../NoResults";
import { StarterBlockProps, STARTER_BLOCKS } from "./configs";
import SearchBox from "../../../../../../shell/components/SearchBox";

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
    <Card
      elevation={0}
      sx={{
        borderRadius: "4px",
        border: "1px solid",
        borderColor: "grey.100",
        boxShadow: "none",
        width: "100%",
        backgroundColor: "grey.100",
        position: "relative",
        ...(isActive && {
          outline: "1px solid",
          outlineColor: (theme) => theme.palette.primary.main,
          outlineOffset: "-1px",
        }),
      }}
    >
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
          >
            <CardMedia
              component="img"
              image={block?.image}
              sx={{ height: "220px", padding: "8px" }}
            />
          </Box>
          <Box
            height="52px"
            px="8px"
            py="16px"
            bgcolor={(theme) =>
              isActive
                ? alpha(theme.palette.primary.main, 0.04)
                : "background.paper"
            }
            {...(isActive && {
              borderTop: "1px solid",
              borderColor: "primary.main",
            })}
          >
            <Typography
              className="card-content"
              variant="body2"
              fontWeight={600}
              color="text.primary"
            >
              {block?.label}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export type StarterBlocksSelectionProps = {
  onClose: () => void;
  setActiveStep: (step: "selection" | "form") => void;
  selectBlockType: (blockType: StarterBlockProps) => void;
  selectBlank?: () => void;
  blockType?: StarterBlockProps;
};

export const StarterBlocksSelection: React.FC<StarterBlocksSelectionProps> = ({
  onClose,
  setActiveStep,
  selectBlockType,
  selectBlank,
  blockType,
}) => {
  const { t } = useTranslation();
  const searchRef = useRef<HTMLDivElement>();
  const [filteredBlockTypes, setFilteredBlockTypes] =
    useState<StarterBlockProps[]>(STARTER_BLOCKS);

  const [search, setSearch] = useState("");

  const handleBlockSelect = (block: StarterBlockProps) => {
    return () => {
      selectBlockType(block);
    };
  };

  const handleSearchRetry = () => {
    setSearch("");
    searchRef.current?.focus();
  };

  const handleNext = useCallback(() => {
    if (blockType?.name === "blank") return selectBlank();
    if (!!blockType) {
      setActiveStep("form");
    }
  }, [blockType, setActiveStep]);

  useEffect(() => {
    if (!search) return setFilteredBlockTypes(STARTER_BLOCKS);
    const filtered = STARTER_BLOCKS.filter((block) => {
      const searchString = `${block.label.toLowerCase()}`;

      return searchString.includes(search.toLowerCase());
    });
    setFilteredBlockTypes(filtered);
  }, [search, STARTER_BLOCKS]);
  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="stretch"
      overflow="hidden"
    >
      <DialogTitle
        component="div"
        flexGrow={0}
        sx={{ height: "128px", minHeight: "128px" }}
      >
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
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent
        data-cy="starter-blocks-selection-dialog"
        sx={{
          py: 2.5,
          backgroundColor: "grey.50",
          minHeight: "400px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          rowGap: 2,
          overflowY: "auto",
          overflowX: "hidden",
          flexGrow: 1,
          position: "relative",
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.300",
            borderRadius: "4px",
          },
        }}
        dividers
      >
        <Box flexGrow={0}>
          <SearchBox
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

        <Box flexGrow={1} position="relative">
          {!filteredBlockTypes?.length ? (
            <Box
              data-cy="no-results-page"
              width="100%"
              height="100%"
              display="grid"
              position="absolute"
              overflow="hidden"
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
              spacing={2}
              columns={3}
              sx={{
                height: "fit-content",
              }}
              data-cy="starter-blocks-container"
            >
              {filteredBlockTypes?.map((block, index) => (
                <Grid key={block?.name} size={1}>
                  <BlockItem
                    block={block}
                    isActive={blockType?.name === block?.name}
                    onClick={handleBlockSelect(block)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: "20px",
          flexGrow: 0,
          height: "76px",
          minHeight: "76px",
          maxHeight: "76px",
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={
            !blockType ||
            !filteredBlockTypes?.length ||
            !filteredBlockTypes?.filter(
              (block) => block?.name === blockType?.name
            )?.length
          }
          data-cy="select-block-type-next-button"
        >
          {t("common.next")}
        </Button>
      </DialogActions>
    </Box>
  );
};
