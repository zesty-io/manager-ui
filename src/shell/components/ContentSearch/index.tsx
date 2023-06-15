import { FC, useState, useRef, useMemo, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import { useHistory, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { ScheduleRounded, SearchRounded } from "@mui/icons-material";
import { isEmpty } from "lodash";

import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { notify } from "../../store/notifications";
import { AdvancedSearch } from "./components/AdvancedSearch";
import useRecentSearches from "../../hooks/useRecentSearches";
import { GlobalSearchItem } from "./components/GlobalSearchItem";
import { getContentTitle, getItemIcon } from "./utils";
import { useSearchModelsByKeyword } from "../../hooks/useSearchModelsByKeyword";
import { useSearchCodeFilesByKeywords } from "../../hooks/useSearchCodeFilesByKeyword";
import { ResourceType } from "../../services/types";
import { SearchAccelerator } from "./components/SearchAccelerator";
import { SEARCH_ACCELERATORS } from "./components/config";

const AdditionalDropdownOptions = [
  "RecentModifiedItemsHeader",
  "RecentSearches",
  "AdvancedSearchButton",
  "SearchAccelerator",
];
const ElementId = "global-search-autocomplete";

export interface Suggestion {
  type: ResourceType;
  ZUID: string;
  title: string;
  updatedAt: string;
  url: string;
  noUrlErrorMessage?: string;
}

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const [searchAccelerator, setSearchAccelerator] =
    useState<ResourceType | null>(null);
  const [open, setOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [recentSearches, addSearchTerm, deleteSearchTerm] = useRecentSearches();
  const [models, setModelKeyword] = useSearchModelsByKeyword();
  const [files, setFileKeyword] = useSearchCodeFilesByKeywords();
  const languages = useSelector((state: any) => state.languages);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const textfieldRef = useRef<HTMLDivElement>();

  const { data: contents } = useSearchContentQuery({ query: value });

  const suggestions: Suggestion[] = useMemo(() => {
    const contentSuggestions: Suggestion[] =
      contents?.map((content) => {
        return {
          type: "content",
          ZUID: content.meta?.ZUID,
          title: getContentTitle(content, languages),
          updatedAt: content.meta?.updatedAt,
          url: isEmpty(content.meta)
            ? ""
            : `/content/${content.meta.contentModelZUID}/${content.meta.ZUID}`,
          noUrlErrorMessage: "Selected item is missing meta data",
        };
      }) || [];

    const modelSuggestions: Suggestion[] =
      models?.map((model) => {
        return {
          type: "schema",
          ZUID: model.ZUID,
          title: model.label,
          updatedAt: model.updatedAt,
          url: `/schema/${model.ZUID}`,
        };
      }) || [];

    const codeFileSuggestions: Suggestion[] =
      files?.map((file) => {
        return {
          type: "code",
          ZUID: file.ZUID,
          title: file.fileName?.split("/").pop(), // Removes the file path from the file name
          updatedAt: file.updatedAt,
          url: `/code/file/views/${file.ZUID}`,
        };
      }) || [];

    let consolidatedResults = [
      ...contentSuggestions,
      ...modelSuggestions,
      ...codeFileSuggestions,
    ];

    // Only show related suggestions when a search accelerator is active
    switch (searchAccelerator) {
      case "code":
        consolidatedResults = [...codeFileSuggestions];
        break;

      case "content":
        consolidatedResults = [...contentSuggestions];
        break;

      case "schema":
        consolidatedResults = [...modelSuggestions];

      default:
        break;
    }

    return consolidatedResults.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [contents, models, files, searchAccelerator]);

  const options = useMemo(() => {
    // Only show the first 5 recent searches when user has not typed in a query
    const _recentSearches =
      recentSearches?.length && !value
        ? ["RecentSearches", ...recentSearches.slice(0, 5)]
        : [];
    // Shows the suggestions when either a value is entered or a search accelerator is activated
    const _suggestions =
      suggestions?.length && (Boolean(value) || Boolean(searchAccelerator))
        ? suggestions?.slice(0, 5)
        : [];

    /** Note: The order of items in this array control the order of how the
     * options will be rendered in the autocomplate dropdown
     */
    return [
      value,
      "SearchAccelerator",
      "RecentModifiedItemsHeader",
      ..._suggestions,
      ..._recentSearches,
      "AdvancedSearchButton",
    ];
  }, [suggestions, recentSearches, value]);

  useEffect(() => {
    setModelKeyword(value);
    setFileKeyword(value);
  }, [value]);

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });

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
          zIndex: 2,
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
          onClose={(_, reason) => {
            // Prevents autocomplete dropdown from closing when
            // user clicks the input field multiple times
            if (reason !== "toggleInput") {
              setOpen(false);
            }
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
            /** This is when the user selects any of the suggestions */

            // null represents "X" button clicked
            if (!newVal) {
              setValue("");
              return;
            }

            // string represents search term entered
            if (typeof newVal === "string") {
              goToSearchPage(newVal);
            } else {
              if (newVal?.url) {
                history.push(newVal.url);
              } else {
                dispatch(
                  notify({
                    kind: "warn",
                    message: newVal.noUrlErrorMessage,
                  })
                );
              }
            }
          }}
          getOptionLabel={(option: Suggestion) => {
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
                    searchAccelerator={searchAccelerator}
                    isSearchTerm={isSearchTerm}
                  />
                );
              }

              // Renders the recent searches component
              // This only renders the subheader, actual data is being set on the suggestions array
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

              // Renders the search accelerators when no search accelerator is active
              if (
                option === "SearchAccelerator" &&
                !Boolean(searchAccelerator)
              ) {
                return (
                  <SearchAccelerator
                    key="SearchAccelerator"
                    onAcceleratorClick={(type) => setSearchAccelerator(type)}
                  />
                );
              }

              // Renders the recently modified items list subheader when an
              // accelerator is active and there is no user input
              if (
                option === "RecentModifiedItemsHeader" &&
                Boolean(searchAccelerator) &&
                !Boolean(value)
              ) {
                const types: Record<ResourceType, string> = {
                  code: "Code Files",
                  content: "Content Items",
                  schema: "Models in Schema",
                };

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
                    Recent Modified {types[searchAccelerator]}
                  </ListSubheader>
                );
              }
            } else {
              return (
                <GlobalSearchItem
                  {...props}
                  key={option.ZUID}
                  icon={getItemIcon(option.type)}
                  text={option.title}
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
                      {Boolean(searchAccelerator) && open ? (
                        <Chip
                          variant="filled"
                          label={`in: ${SEARCH_ACCELERATORS[searchAccelerator]?.text}`}
                          color="primary"
                          size="small"
                          onDelete={() => setSearchAccelerator(null)}
                        />
                      ) : (
                        <SearchIcon fontSize="small" color="action" />
                      )}
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
          ListboxProps={{
            style: {
              paddingTop: value ? "8px" : "0px",
            },
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
