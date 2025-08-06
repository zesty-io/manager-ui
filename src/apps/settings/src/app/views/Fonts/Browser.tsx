import { useEffect, useState, FC, useMemo, useRef, useCallback } from "react";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

import { MainWrapper } from "../../components/Wrappers";
import { TopBar } from "../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button, Portal, FormGroup, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  useCreateHeadTagMutation,
  useGetWebFontsQuery,
  useGetHeadTagsQuery,
  useUpdateHeadTagsMutation,
} from "../../../../../../shell/services/instance";
import { WithLoader } from "@zesty-io/core/WithLoader";
import AddIcon from "@mui/icons-material/Add";
import { notify } from "../../../../../../shell/store/notifications";
import { FormControlLabel, Checkbox } from "@mui/material";
// import { GoogleFonts } from "../../../../../shell/services/types";
import { useDispatch, useSelector } from "react-redux";
import {
  FONT_QUERY_MAP,
  InstalledFont,
  parseInstalledFonts,
} from "./constants";
import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import { AppState } from "../../../../../../shell/store/types";
import { fetchFontsInstalled } from "../../../../../../shell/store/settings";
import { fetchHeadTags } from "../../../../../../shell/store/headTags";

export type FontRowItemProps = {
  ZUID: string | null;
  family: string;
  variants: string[];
  installedVariants: string[];
  previewText: string;
  // onDelete: (font: any) => void;
  activePage: number;
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

      dispatch(fetchFontsInstalled());

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
      <Portal container={document.head}>
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css?family=${family?.replace(
            /\s/g,
            "+"
          )}`}
        />
      </Portal>
    </>
  );
};
const Browser = () => {
  const [loadComplete, setLoadComplete] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [activePage, setActivePage] = useState<number>(0);
  const [activePagination, setActivePagination] = useState([]);
  const [previewText, setPreviewText] = useState<string>("");

  const {
    data: installedFontsData,
    isLoading: installedFontsIsLoading,
    isError: installedFontsIsError,
    isFetching: installedFontsIsFetching,
  } = useGetHeadTagsQuery();
  const {
    data: googleFontsData,
    isLoading: googleFontsIsLoading,
    isError: googleFontsIsError,
    isFetching: googleFontsIsFetching,
  } = useGetWebFontsQuery();

  const isLoading =
    googleFontsIsLoading ||
    installedFontsIsLoading ||
    googleFontsIsFetching ||
    installedFontsIsFetching;

  const fontData = useMemo(() => {
    if (googleFontsIsLoading || installedFontsIsLoading) return;
    if (!!googleFontsIsError) {
      return [];
    } else {
      const installedFonts = !!installedFontsIsError
        ? []
        : parseInstalledFonts(installedFontsData);

      const paginationWithZUID = [...googleFontsData]
        ?.sort((a: any, b: any) => a?.family?.localeCompare(b?.family))
        ?.map((gFont, index) => {
          const currentInstalledFonts = installedFonts?.find(
            (item: InstalledFont) => item?.family === gFont?.family
          );

          return {
            index: index,
            family: gFont?.family,
            ZUID: currentInstalledFonts?.ZUID || null,
            variants: gFont?.variants,
            installedVariants: currentInstalledFonts?.variants,
          };
        });

      setLoadComplete(true);
      return paginationWithZUID;
    }
  }, [
    installedFontsIsLoading,
    googleFontsIsLoading,
    installedFontsData,
    googleFontsData,
    googleFontsIsError,
    installedFontsIsError,
  ]);

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
          <TextField
            id="filled-search"
            placeholder="Search font"
            type="text"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            inputProps={{
              ref: searchInputRef,
            }}
            value={search}
            onChange={(evt) => {
              if (activePage > 0) {
                setActivePage(0);
              }
              setSearch(evt.target.value);
            }}
            sx={{
              flexGrow: 0,
              width: "260px",
            }}
          />
        </Box>
      </TopBar>

      <MainWrapper height="100%" fullWidth rowGap={0}>
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
          <Box width="100%" height="100%" display="grid" alignContent="center">
            <NoResults
              type="search"
              searchTerm={search}
              onButtonClick={() => {
                setSearch("");
                searchInputRef?.current?.focus();
              }}
            />
          </Box>
        ) : (
          <>
            {activePagination?.map((itemFont, index) => (
              <FontRowItem
                // index={index}
                previewText={previewText}
                key={itemFont?.ZUID || index}
                family={itemFont?.family}
                variants={[...itemFont?.variants]}
                installedVariants={itemFont?.installedVariants}
                // index={itemFont?.index}
                ZUID={itemFont?.ZUID}
                // onDelete={() => {}}
                // page={Math.ceil(paginationData?.length / 10) || 1}
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
      </MainWrapper>
    </>
  );
};
export default Browser;
