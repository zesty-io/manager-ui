import { useEffect, useState, useMemo, useRef } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { TopBar } from "../../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button, Portal } from "@mui/material";
import { NoResults } from "../../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../../shell/components/SearchBox";
import FontFamilyCard from "./FontFamilyCard";
import { useSettingsFonts } from "../hooks/useSettingsFonts";

type InstalledFont = {
  ZUID: string;
  family: string;
  variants: string[];
  href: string;
};

const Browse = () => {
  const [loadComplete, setLoadComplete] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [prevActivePage, setPrevActivePage] = useState<number>(0);
  const [activePage, setActivePage] = useState<number>(0);
  const [activePagination, setActivePagination] = useState([]);
  const [previewText, setPreviewText] = useState<string>("");

  const { installedFonts, webFonts, isLoading, getFontDataFromHref } =
    useSettingsFonts();

  const fontData = useMemo(() => {
    if (isLoading) return;
    if (!webFonts?.length) {
      return [];
    } else {
      const paginationWithZUID = [...webFonts]
        ?.sort((a, b) => a?.family?.localeCompare(b?.family))
        ?.map((gFont, index) => {
          const currentInstalledFonts = installedFonts?.find(
            (item: InstalledFont) => {
              const { family } = getFontDataFromHref(item?.href);
              return family === gFont?.family;
            }
          );

          const { variants } = getFontDataFromHref(currentInstalledFonts?.href);

          return {
            index: index,
            family: gFont?.family,
            ZUID: currentInstalledFonts?.ZUID || null,
            variants: gFont?.variants,
            installedVariants: variants,
          };
        });

      setLoadComplete(true);
      return paginationWithZUID;
    }
  }, [installedFonts, webFonts, isLoading]);

  const paginationData = useMemo(() => {
    if (!fontData) return [];
    if (!search) return fontData;

    const searchFilteredFontData = fontData?.filter((font) =>
      font?.family?.toLowerCase().includes(search.toLowerCase())
    );

    return searchFilteredFontData;
  }, [search, fontData]);

  useEffect(() => {
    if (!loadComplete || !paginationData) return;
    const start = activePage * 10;
    const end = start + 10;

    const currentPageData = paginationData.slice(start, end);

    setActivePagination([...currentPageData]);
  }, [paginationData, loadComplete, activePage]);

  return (
    <>
      {!!activePagination?.length && (
        <Portal container={document.head}>
          {activePagination?.map((itemFont) => (
            <link
              key={itemFont?.family}
              rel="stylesheet"
              href={`https://fonts.googleapis.com/css?family=${itemFont?.family?.replace(
                /\s/g,
                "+"
              )}`}
            />
          ))}
        </Portal>
      )}
      <TopBar
        title="Browse Fonts"
        isNotSaved={false}
        isLoading={false}
        saveHidden
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          columnGap={2}
        >
          <SearchBox
            data-cy="BrowseFontSearchInput"
            placeholder="Search Fonts"
            type="text"
            variant="outlined"
            size="small"
            value={search}
            onChange={(evt) => {
              if (activePage !== 0 && !!evt.target.value) {
                setActivePage(0);
                setPrevActivePage(activePage);
              }

              if (
                activePage === 0 &&
                !evt.target.value &&
                activePage !== prevActivePage
              ) {
                setActivePage(prevActivePage);
                setPrevActivePage(prevActivePage);
              }
              setSearch(evt.target.value);
            }}
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "grey.50",
              },
            }}
            sx={{
              width: "280px",
            }}
          />
        </Box>
      </TopBar>

      <Box
        className="main-wrapper"
        px={4}
        sx={{
          width: "100%",
          height: "calc(100% - 84px)",
          overflowY: "auto",
          overflowX: "hidden",
          margin: 0,
          display: "block",
          maxHeight: "calc(100% - 84px)",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <Box
          py={2}
          height="100%"
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          sx={{
            minHeight: "100%",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              width: "100%",

              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid",
              borderColor: "border",
              pb: 3,
            }}
          >
            <TextField
              id="previewText"
              placeholder="Type something to preview"
              type="text"
              variant="outlined"
              size="small"
              name="previewText"
              value={previewText}
              onChange={(evt) => setPreviewText(evt.target.value)}
              sx={{
                width: "60%",
                minWidth: "300px",
              }}
            />
          </Box>
          {!isLoading && paginationData?.length < 1 ? (
            <Box
              width="100%"
              height="100%"
              display="grid"
              alignContent="center"
              data-cy="BrowseFontNoResultsContainer"
            >
              <NoResults
                type="search"
                searchTerm={search}
                onButtonClick={() => {
                  setSearch("");
                  setActivePage(prevActivePage);
                  searchInputRef?.current?.focus();
                }}
              />
            </Box>
          ) : (
            <>
              <Box width="100%" data-cy="FontListContainer">
                {activePagination?.map((itemFont, index) => (
                  <FontFamilyCard
                    previewText={previewText}
                    key={itemFont?.family + index}
                    family={itemFont?.family}
                    variants={[...itemFont?.variants]}
                    installedVariants={itemFont?.installedVariants}
                    ZUID={itemFont?.ZUID}
                    activePage={activePage + 1}
                  />
                ))}
              </Box>
              <Box
                width="100%"
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                py={5}
                boxSizing="border-box"
              >
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    setActivePage((prev) => prev - 1);
                  }}
                  disabled={activePage === 0}
                  sx={{
                    py: 2,
                    width: 64,
                  }}
                >
                  Prev
                </Button>
                <Typography
                  variant="h5"
                  sx={{
                    width: "85px",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                  noWrap
                >
                  {`${activePage + 1} / ${
                    Math.ceil(paginationData?.length / 10) || 1
                  }`}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setActivePage((prev) => prev + 1);
                  }}
                  disabled={
                    activePage >= Math.ceil(paginationData?.length / 10) - 1
                  }
                  sx={{
                    py: 2,
                    width: 64,
                  }}
                >
                  Next
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};
export default Browse;
