import { useState, useRef, useMemo, useEffect } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { TopBar } from "../../../components/TopBar";
import Box from "@mui/material/Box";
import { Portal, Typography } from "@mui/material";
import { NoResults } from "../../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../../shell/components/SearchBox";
import WebFontCard from "./WebFontCard";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../../shell/store/types";
import { HeadTag } from "../../../../../../../shell/services/types";
import { useDeleteHeadTagMutation } from "../../../../../../../shell/services/instance";
import { fetchFontsInstalled } from "../../../../../../../shell/store/settings";

export interface FontData {
  ZUID: string;
  family: string;
  variants: string[];
  href: string;
}

export const useInstalledFonts = () => {
  const dispatch = useDispatch();
  const fontData: HeadTag[] = useSelector(
    ({ settings }: AppState) => settings?.fontsInstalled || []
  );
  const [deleteFont] = useDeleteHeadTagMutation();

  const deleteDuplicateInstalls = async (ZUIDs: string[]) => {
    try {
      const deletePromises = ZUIDs.map((zuid) => deleteFont(zuid).unwrap());
      await Promise.all(deletePromises);
      dispatch(fetchFontsInstalled());
    } catch (error) {
      console.error("Failed to delete duplicate fonts:", error);
    }
  };

  const { fonts } = useMemo(() => {
    const fontMap = new Map<string, { ZUID: string; variants: Set<string> }>();
    const duplicates: string[] = [];

    fontData.forEach((item) => {
      try {
        const href = item.attributes.href.replace("https//", "https://");
        const url = new URL(href);

        const familyParam = url.searchParams.get("family") || "";
        const [family, variantsString = ""] = familyParam.split(":");
        const variants = variantsString.split(",").filter(Boolean);

        if (!family) return;

        if (fontMap.has(family)) {
          const existing = fontMap.get(family)!;
          variants.forEach((v) => existing.variants.add(v));
          duplicates.push(item.ZUID);
        } else {
          fontMap.set(family, {
            ZUID: item.ZUID,
            variants: new Set(variants),
          });
        }
      } catch (error) {
        console.warn("Invalid font URL:", item.attributes.href);
      }
    });

    // DELETE DUPLICATE INSTALLED FONTS
    if (!!duplicates?.length) {
      deleteDuplicateInstalls(duplicates);
    }

    const fonts = Array.from(fontMap.entries()).map(
      ([family, { ZUID, variants }]) => ({
        ZUID,
        family,
        variants: !variants?.size ? [] : Array.from(variants),
        href: `https://fonts.googleapis.com/css?family=${encodeURIComponent(
          family
        )}:${Array.from(variants).join(",")}`,
      })
    );

    return { fonts };
  }, [fontData]);

  return { fonts };
};

const Installed = () => {
  const searchInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const { fonts: installedFonts } = useInstalledFonts();

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
      {!!installedFonts?.length && (
        <Portal container={document.head}>
          {installedFonts?.map((item) => (
            <link rel="stylesheet" href={item?.href} key={item.ZUID} />
          ))}
        </Portal>
      )}
      <TopBar title="Installed Fonts">
        <Box display="flex" alignItems="center" justifyContent="flex-end">
          <SearchBox
            data-cy="InstalledFontSearchInput"
            placeholder="Search Fonts"
            type="text"
            variant="outlined"
            size="small"
            value={search}
            onChange={(evt) => setSearch(evt.target.value)}
            inputRef={searchInputRef}
            disabled={!filteredInstalledFonts?.length}
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
                  <Typography variant="h5" color="text.secondary">
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
                data-cy="FontListContainer"
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
