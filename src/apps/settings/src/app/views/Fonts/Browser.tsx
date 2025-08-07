import { useEffect, useState, FC, useMemo, useRef, useCallback } from "react";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { TopBar } from "../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button, Portal, FormGroup } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  useCreateHeadTagMutation,
  useUpdateHeadTagsMutation,
} from "../../../../../../shell/services/instance";
import AddIcon from "@mui/icons-material/Add";
import { notify } from "../../../../../../shell/store/notifications";
import { FormControlLabel, Checkbox } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import { AppState } from "../../../../../../shell/store/types";
import SearchBox from "../../../../../../shell/components/SearchBox";
import { useSettingsFonts } from "../../components/useSettingsFonts";

export type FontRowItemProps = {
  ZUID: string | null;
  family: string;
  variants: string[];
  installedVariants: string[];
  previewText: string;
  activePage: number;
};
type InstalledFont = {
  ZUID: string;
  family: string;
  variants: string[];
  href: string;
};
const FontRowItem: FC<FontRowItemProps> = ({
  ZUID = null,
  family,
  variants,
  installedVariants,
  previewText,
  activePage,
}) => {
  const dispatch = useDispatch();
  const instance = useSelector((state: AppState) => state.instance);

  const [selectedVariants, setSelectedVariants] = useState([]);
  const [activeVariants, setActiveVariants] = useState(installedVariants);

  const {
    installedFonts,
    isLoading: isLoadingInstalledFonts,
    getFontDataFromHref,
  } = useSettingsFonts();

  const [createHeadTag, { isLoading: isCreating }] = useCreateHeadTagMutation();
  const [updateFont, { isLoading: isUpdating }] = useUpdateHeadTagsMutation();

  const isLoading = isCreating || isUpdating;

  const handleSelectionChange = (value: boolean, item: string) => {
    if (value) {
      setSelectedVariants((prev) => [...prev, item]);
    } else {
      setSelectedVariants((prev) => prev.filter((variant) => variant !== item));
    }
  };

  const handleFontInstall = useCallback(async () => {
    try {
      const cssLinkUrl = "https://fonts.googleapis.com/css?family=";

      const currentlyInstalledVariants = !installedVariants
        ? selectedVariants
        : [...installedVariants, ...selectedVariants];

      const newFontName = family?.trim()?.replace(/\s/g, "+");
      const linkHref = `${cssLinkUrl}${newFontName}:${currentlyInstalledVariants?.join(
        ","
      )}`;

      let response: any = null;
      if (!ZUID) {
        response = await createHeadTag({
          type: "link",
          resourceZUID: instance.ZUID,
          sort: 0,
          attributes: {
            rel: "stylesheet",
            href: linkHref,
          },
        });
      } else {
        response = await updateFont({
          ZUID,
          href: linkHref,
        });
      }

      // dispatch(fetchFontsInstalled());

      if (!response?.error) {
        setSelectedVariants([]);
        setActiveVariants(currentlyInstalledVariants);
        dispatch(
          notify({
            kind: "success",
            message: `Font "${family} (${selectedVariants.join(
              ", "
            )})" has been installed`,
          })
        );
      } else {
        throw new Error(`${response?.error?.data?.error}`);
      }
    } catch (error) {
      dispatch(
        notify({
          kind: "error",
          message: `Failed to add ${family} (${selectedVariants.join(
            ", "
          )}): ${error}`,
        })
      );
    }
  }, [ZUID, selectedVariants, installedVariants]);

  useEffect(() => {
    setSelectedVariants([]);
  }, [activePage]);

  return (
    <>
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "grey.200",
          pb: 2,
          pt: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            columnGap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexDirection: "column",
              width: "100%",
              rowGap: 1.25,
            }}
          >
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {family}
            </Typography>
            <Box
              sx={{
                lineHeight: 2,
                textTransform: "capitalize",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <FormGroup row>
                {variants?.map((item: string, index: number) => (
                  <FormControlLabel
                    key={`${family}-${item}-${ZUID || index}`}
                    color="text.primary"
                    control={
                      <Checkbox
                        key={`${family}-${item}-${ZUID || index}`}
                        color="primary"
                        size="small"
                        id={`${family}-${item}-${ZUID || index}`}
                        checked={
                          (selectedVariants?.includes(item) ||
                            activeVariants?.includes(item)) ??
                          false
                        }
                        disabled={activeVariants?.includes(item)}
                        readOnly={activeVariants?.includes(item)}
                        onChange={(_e, val) => handleSelectionChange(val, item)}
                        sx={{ p: 0 }}
                      />
                    }
                    label={item}
                    labelPlacement="end"
                    slotProps={{
                      typography: {
                        variant: "body2",
                        fontWeight: 400,
                        color: "text.secondary",

                        pr: 0.25,
                        pl: 0,
                        width: "60px",
                      },
                    }}
                    sx={{
                      m: 0,
                    }}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>

          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleFontInstall}
            disabled={!isLoading && !selectedVariants?.length}
            startIcon={<AddIcon />}
            loading={isLoading}
            loadingPosition="center"
            sx={{
              minWidth: "fit-content",
            }}
          >
            Add
          </LoadingButton>
        </Box>
        <Typography
          variant="h4"
          fontWeight={400}
          color="text.primary"
          sx={{ fontFamily: `"${family}"`, mt: 1 }}
        >
          {previewText
            ? previewText
            : "All their equipment and instruments are alive."}
        </Typography>
      </Box>
    </>
  );
};
const Browser = () => {
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
        ?.sort((a: any, b: any) => a?.family?.localeCompare(b?.family))
        ?.map((gFont, index) => {
          const currentInstalledFonts = installedFonts?.find(
            (item: InstalledFont) => {
              const { family, variants } = getFontDataFromHref(item?.href);
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
          sx={{
            "& .MuiInputBase-root fieldset": {
              bgcolor: "grey.50",
            },
            "& .MuiInputBase-root": {
              "& input, & .MuiInputAdornment-root": {
                zIndex: 5,
              },
            },
          }}
        >
          <SearchBox
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
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: "280px",
              "& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-sizeSmall":
                {
                  py: 0.5,
                  bgcolor: "grey.50",
                },
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
          margin: "0",
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
              {activePagination?.map((itemFont, index) => (
                <FontRowItem
                  previewText={previewText}
                  key={itemFont?.family + index}
                  family={itemFont?.family}
                  variants={[...itemFont?.variants]}
                  installedVariants={itemFont?.installedVariants}
                  ZUID={itemFont?.ZUID}
                  activePage={activePage + 1}
                />
              ))}
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
export default Browser;
