import { useState, useRef, useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { TopBar } from "../../../components/TopBar";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import { NoResults } from "../../../../../../schema/src/app/components/NoResults";
import SearchBox from "../../../../../../../shell/components/SearchBox";
import WebFontCard from "./WebFontCard";
import { useSettingsFonts } from "../hooks/useSettingsFonts";

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
