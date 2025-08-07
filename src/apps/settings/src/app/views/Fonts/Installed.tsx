import { useState, useRef, useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { TopBar } from "../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button } from "@mui/material";

import DeleteFontDialog from "./DeleteFontDialog";
import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../shell/components/SearchBox";
import { useSettingsFonts } from "../../components/useSettingsFonts";
import { capitalize } from "lodash";

const FONT_PREVIEW_TEXT = "All their equipment and instruments are alive.";

export type FontItemCardProps = {
  ZUID: string;
  family: string;
  variants: string[];
};

const getWeightAndStyle = (fontText: string) => {
  const sanitizedVariant = fontText?.trim()?.toLowerCase();
  const fontWeight = ["regular", "italic"]?.includes(sanitizedVariant)
    ? "400"
    : fontText?.replace(/italic/g, "");

  const fontStyle = sanitizedVariant?.includes("italic") ? "italic" : "normal";

  return {
    weight: +fontWeight,
    style: fontStyle,
  };
};

const WebFontCard = ({ ZUID, href }: { ZUID: string; href: string }) => {
  const { getFontDataFromHref } = useSettingsFonts();
  const { family, variants } = getFontDataFromHref(href);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [fontForDelete, setFontForDelete] = useState(null);
  const handleDeleteFontVariant = (variant: any) => {
    const updatedVariants = variants?.filter((item: any) => item !== variant);
    setFontForDelete({ ZUID, family, variant, updatedVariants });
    setDeleteDialogIsOpen(true);
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{
          width: "100%",
          pt: 4,
          borderBottom: "1px solid",
          borderColor: "grey.200",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography variant="h6" color="text.primary" fontWeight={700} noWrap>
          {family}
        </Typography>

        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="flex-start"
          width="100%"
          sx={{ pt: 3, pb: 1 }}
        >
          {variants
            ?.sort((a: string, b: string) => {
              const { weight: aWeight } = getWeightAndStyle(a);
              const { weight: bWeight } = getWeightAndStyle(b);
              return aWeight - bWeight;
            })
            ?.map((variant) => {
              const sanitizedVariant = variant?.trim()?.toLowerCase();

              const fontWeight = ["regular", "italic"]?.includes(
                sanitizedVariant
              )
                ? "400"
                : variant?.replace(/(italic|i)/g, "");

              const fontStyle =
                sanitizedVariant?.includes("italic") ||
                sanitizedVariant?.includes("i")
                  ? "italic"
                  : "normal";

              return (
                <Box
                  key={`${family}-${fontWeight}-${fontStyle}`}
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                  sx={{
                    py: 2,
                    position: "relative",
                    overflow: "hidden",
                    columnGap: 4,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={+fontWeight}
                    fontStyle={fontStyle}
                    fontFamily={family}
                    noWrap
                  >
                    {FONT_PREVIEW_TEXT}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteFontVariant(variant)}
                    startIcon={<DeleteIcon fontSize="small" />}
                    sx={{
                      flexGrow: 0,
                      whiteSpace: "nowrap",
                      minWidth: "fit-content",
                    }}
                  >
                    {`Remove ${capitalize(variant)}`}
                  </Button>
                </Box>
              );
            })}
        </Box>
      </Box>
      {!!deleteDialogIsOpen && (
        <DeleteFontDialog
          open={deleteDialogIsOpen}
          onClose={() => setDeleteDialogIsOpen(false)}
          family={fontForDelete?.family}
          variant={fontForDelete?.variant}
          ZUID={fontForDelete?.ZUID}
        />
      )}
    </>
  );
};

const Installed = () => {
  const searchInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const { installedFonts, renderLinkTags } = useSettingsFonts();

  const filteredInstalledFonts = useMemo(() => {
    if (!installedFonts?.length) return [];
    return !search
      ? installedFonts
      : installedFonts.filter((item) =>
          item.href
            .toLowerCase()
            .includes(
              `family=${search.replace(/[\+％＋]/g, " ")}`.toLowerCase()
            )
        );
  }, [installedFonts, search]);

  return (
    <>
      {renderLinkTags()}
      <TopBar title="Installed Fonts">
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <SearchBox
            placeholder="Search Fonts"
            type="text"
            variant="outlined"
            size="small"
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
            inputRef={searchInputRef}
            disabled={!filteredInstalledFonts?.length}
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
            {" "}
            {filteredInstalledFonts?.length < 1 ? (
              <Box
                width="100%"
                height="100%"
                position="absolute"
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {!search ? (
                  <Typography variant="h5" color="text.seconddary">
                    No Installed Fonts
                  </Typography>
                ) : (
                  <NoResults
                    type="search"
                    searchTerm={search}
                    onButtonClick={() => {
                      setSearch("");
                      searchInputRef?.current?.focus();
                    }}
                  />
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  py: 2,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                }}
              >
                {filteredInstalledFonts?.map((font) => (
                  <WebFontCard key={font?.ZUID} {...font} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};
export default Installed;
