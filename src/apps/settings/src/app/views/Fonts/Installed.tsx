import { useEffect, useState, FC, useRef, useMemo } from "react";

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";

import { MainWrapper } from "../../components/Wrappers";
import { TopBar } from "../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography, Button, Portal } from "@mui/material";
import { useGetHeadTagsQuery } from "../../../../../../shell/services/instance";

import DeleteFontDialog from "./DeleteFontDialog";
import { InstalledWebFont, parseInstalledFonts } from "./constants";
import { NoResults } from "../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../shell/components/SearchBox";
import { getWebFontFromUrl } from "./utils";

const FONT_PREVIEW_TEXT =
  "All their equipment and instruments are alive. All their equipment and instruments are alive.";

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
  const { family, variants } = getWebFontFromUrl(href);

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
                    {`Remove ${fontWeight} ${
                      fontStyle === "normal" ? "" : fontStyle
                    }`.trim()}
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
          variants={fontForDelete?.updatedVariants}
          ZUID={fontForDelete?.ZUID}
        />
      )}
    </>
  );
};

const Installed = ({ webFonts }: { webFonts: InstalledWebFont[] }) => {
  const searchInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const { data } = useGetHeadTagsQuery();

  const installedFonts: InstalledWebFont[] = useMemo(() => {
    if (!data?.length) return [];
    return !search
      ? webFonts
      : webFonts.filter((item) =>
          item.href
            .toLowerCase()
            .includes(
              `family=${search.replace(/[\+％＋]/g, " ")}`.toLowerCase()
            )
        );
  }, [webFonts, search]);

  return (
    <>
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
      <MainWrapper fullWidth rowGap={0}>
        {installedFonts?.length < 1 ? (
          <Box
            width="100%"
            height="100%"
            position="absolute"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            {!search ? (
              "No Installed Fonts"
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
            {installedFonts?.map((font) => (
              <WebFontCard key={font?.ZUID} {...font} />
            ))}
          </Box>
        )}
      </MainWrapper>
    </>
  );
};
export default Installed;
