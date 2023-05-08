import { FC, useState, useRef, useMemo } from "react";
import SearchIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import {
  ListItem,
  Button,
  TextField,
  Autocomplete,
  Paper,
  Popper,
  Collapse,
  IconButton,
  ListSubheader,
} from "@mui/material";
import { useHistory, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { ScheduleRounded, SearchRounded, Create } from "@mui/icons-material";

import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { notify } from "../../store/notifications";
import { AdvancedSearch } from "./components/AdvancedSearch";
import useRecentSearches from "../../hooks/useRecentSearches";
import { GlobalSearchItem } from "./components/GlobalSearchItem";

const AdditionalDropdownOptions = ["RecentSearches", "AdvancedSearchButton"];
const ElementId = "global-search-autocomplete";

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [recentSearches, addSearchTerm, deleteSearchTerm] = useRecentSearches();
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const textfieldRef = useRef<HTMLDivElement>();

  const res = useSearchContentQuery({ query: value }, { skip: !value });

  const suggestions = res.data;
  const options = useMemo(() => {
    // Only show the first 5 recent searches when user has not typed in a query
    const _recentSearches =
      recentSearches?.length && !value
        ? ["RecentSearches", ...recentSearches.slice(0, 5)]
        : [];
    const _suggestions =
      suggestions?.length && value ? suggestions?.slice(0, 5) : [];

    return [value, ..._suggestions, ..._recentSearches, "AdvancedSearchButton"];
  }, [suggestions, recentSearches, value]);

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });
  const languages = useSelector((state: any) => state.languages);
  const [open, setOpen] = useState(false);

  const theme = useTheme();

  const goToSearchPage = (queryTerm: string) => {
    const isOnSearchPage = location.pathname === "/search";

    setOpen(false);
    addSearchTerm(queryTerm);
    textfieldRef.current?.querySelector("input").blur();

    if (queryTerm !== value) {
      // Makes sure that the textfield value gets updated if the user has clicked on a recent search item
      setValue(queryTerm);
    }

    // Only add the search page on the history stack during initial page visit
    // Makes sure clicking close on the search page brings the user back to the previous page
    if (isOnSearchPage) {
      history.replace(`/search?q=${queryTerm}`);
    } else {
      history.push(`/search?q=${queryTerm}`);
    }
  };

  return (
    <>
      <Collapse
        in
        collapsedSize="288px"
        orientation="horizontal"
        sx={{
          zIndex: (theme) => theme.zIndex.appBar - 1,
          height: "40px",
          position: "relative",
          "& .MuiCollapse-entered": {
            width: "500px",
          },
        }}
      >
        <Autocomplete
          value={value}
          open={open}
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          PaperComponent={(props) => {
            return (
              <Paper
                {...props}
                elevation={0}
                sx={{
                  borderStyle: "solid",
                  borderWidth: options?.length ? "0px 1px 1px 1px" : "0px",
                  borderColor: "border",
                  borderRadius: "0px 0px 4px 4px",

                  "& .MuiAutocomplete-listbox": {
                    maxHeight: "60vh",
                  },
                }}
              />
            );
          }}
          PopperComponent={(props) => {
            return (
              <Popper
                {...props}
                style={{
                  ...props.style,
                  // default z-index is too high, we want it to be BELOW the side nav close button
                  zIndex: theme.zIndex.appBar - 1,
                }}
              />
            );
          }}
          id={ElementId}
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          blurOnSelect
          options={options}
          filterOptions={(x) => x}
          sx={{
            height: "40px",
            width: open ? "500px" : "288px",
            "& .MuiOutlinedInput-root": {
              py: "2px",
            },
            boxSizing: "border-box",
            "& .MuiFormControl-root": {
              gap: "10px",
            },
            "&.Mui-focused .MuiAutocomplete-clearIndicator": {
              visibility: value ? "visible" : "hidden",
            },
          }}
          onInputChange={(event, newVal) => {
            setValue(newVal);
          }}
          onChange={(event, newVal) => {
            // null represents "X" button clicked
            if (!newVal) {
              setValue("");
              return;
            }
            // string represents search term entered
            if (typeof newVal === "string") {
              goToSearchPage(newVal);
            } else {
              // ContentItem represents a suggestion being clicked
              if (newVal?.meta) {
                history.push(
                  `/content/${newVal.meta.contentModelZUID}/${newVal.meta.ZUID}`
                );
              } else {
                dispatch(
                  notify({
                    kind: "warn",
                    message: "Selected item is missing meta data",
                  })
                );
              }
            }
          }}
          getOptionLabel={(option: ContentItem) => {
            // do not change the input value when a suggestion is selected
            return value;
          }}
          renderOption={(props, option) => {
            if (typeof option === "string") {
              if (!AdditionalDropdownOptions.includes(option)) {
                // Means that this option is the top row global search term typed by the userf
                const isSearchTerm = props.id === `${ElementId}-option-0`;

                // Determines if the user-typed top row global search term already exists in the recent searches
                const searchTermInRecentSearches =
                  isSearchTerm && recentSearches.includes(option);

                // Hides the top row global search term if no value is present
                if (isSearchTerm && !value) {
                  return;
                }

                return (
                  <GlobalSearchItem
                    {...props}
                    // Hacky: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
                    aria-selected={false}
                    data-cy={
                      isSearchTerm
                        ? "global-search-term"
                        : "global-search-recent-keyword"
                    }
                    key={isSearchTerm ? "global-search-term" : option}
                    icon={
                      !isSearchTerm || searchTermInRecentSearches
                        ? ScheduleRounded
                        : SearchRounded
                    }
                    onClick={() => goToSearchPage(option)}
                    text={option}
                    isRemovable={!isSearchTerm || searchTermInRecentSearches}
                    onRemove={deleteSearchTerm}
                  />
                );
              }

              // Renders the recent searches component
              if (option === "RecentSearches") {
                return (
                  <ListSubheader
                    sx={{
                      px: 1.5,
                      pb: 0.5,
                      pt: 0,
                      mt: 1,
                      fontSize: "12px",
                      fontWeight: 600,
                      lineHeight: "18px",
                      letterSpacing: "0.15px",
                    }}
                    key={option}
                  >
                    Recent Searches
                  </ListSubheader>
                );
              }

              // Renders the advanced search button
              if (option === "AdvancedSearchButton") {
                return (
                  <ListItem
                    sx={{
                      height: 32,
                      mt: 1,
                    }}
                    key={option}
                  >
                    <Button
                      data-cy="AdvancedSearchButton"
                      size="small"
                      onClick={() => setIsAdvancedSearchOpen(true)}
                    >
                      Advanced Search
                    </Button>
                  </ListItem>
                );
              }
            } else {
              // type of ContentItem represents a suggestion from the search API
              const getText = () => {
                const title = option?.web?.metaTitle || "Missing Meta Title";
                const langCode = languages.find(
                  (lang: any) => lang.ID === option?.meta?.langID
                )?.code;
                const langDisplay = langCode ? `(${langCode}) ` : null;
                return langDisplay ? `${langDisplay}${title}` : title;
              };
              return (
                <GlobalSearchItem
                  {...props}
                  key={option.meta.ZUID}
                  icon={Create}
                  text={getText()}
                />
              );
            }
          }}
          renderInput={(params: any) => {
            return (
              <TextField
                {...params}
                ref={textfieldRef}
                fullWidth
                data-cy="global-search-textfield"
                variant="outlined"
                placeholder={`Search Instance ${shortcutHelpText}`}
                sx={{
                  height: "40px",
                  "& .Mui-focused": {
                    width: "500px",
                  },
                  "&:hover .MuiButtonBase-root.MuiAutocomplete-clearIndicator":
                    {
                      visibility: value ? "visible" : "hidden",
                    },
                  "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
                    visibility: value ? "visible" : "hidden",
                  },
                  ".MuiAutocomplete-endAdornment": {
                    position: "initial",
                  },
                  "& .MuiInputBase-root.MuiAutocomplete-inputRoot.MuiOutlinedInput-root":
                    {
                      pr: "0px",
                    },
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    goToSearchPage(value);
                  }
                }}
                inputProps={{
                  ...params.inputProps,
                  style: {
                    ...params.inputProps.style,
                    paddingLeft: "4px",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start" sx={{ marginRight: 0 }}>
                      <SearchIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <InputAdornment position="end">
                        <IconButton
                          data-cy="GlobalSearchFilterButton"
                          size="small"
                          sx={{ marginRight: 1 }}
                          onClick={() => setIsAdvancedSearchOpen(true)}
                        >
                          <TuneRoundedIcon fontSize="small" color="action" />
                        </IconButton>
                      </InputAdornment>
                    </>
                  ),
                  sx: {
                    "&.MuiAutocomplete-inputRoot": {
                      py: "2px",
                      height: "40px",
                    },

                    borderRadius: open ? "4px 4px 0px 0px" : "0px",
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid",
                      borderColor: "border",
                    },
                    "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
                      border: "1px solid",
                      borderColor: "border",
                    },
                    boxSizing: "border-box",
                    width: "100%",
                    backgroundColor: (theme) => theme.palette.background.paper,
                  },
                }}
              />
            );
          }}
        />
      </Collapse>

      {isAdvancedSearchOpen && (
        <AdvancedSearch
          keyword={value}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearch={(searchData) => addSearchTerm(searchData.keyword)}
        />
      )}
    </>
  );
};

export default ContentSearch;
