import { useState, useRef, useMemo, useEffect } from "react";
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
  Skeleton,
} from "@mui/material";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { isEmpty } from "lodash";
import { lightTheme as theme } from "@zesty-io/material";

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
import { useGetActiveApp } from "../../hooks/useGetActiveApp";
import {
  useSearchBinFilesQuery,
  useGetBinsQuery,
  useGetAllBinFilesQuery,
} from "../../services/mediaManager";
import { useSearchMediaFoldersByKeyword } from "../../hooks/useSearchMediaFoldersByKeyword";
import { RecentSearchItem } from "./components/RecentSearchItem";
import { KeywordSearchItem } from "./components/KeywordSearchItem";
import { useParams } from "../../hooks/useParams";
import { withCursorPosition } from "../../components/withCursorPosition";

// List of dropdown options that are NOT suggestions
const AdditionalDropdownOptions = [
  "RecentModifiedItemsHeader",
  "RecentSearches",
  "AdvancedSearchButton",
  "SearchAccelerator",
];
const ElementId = "global-search-autocomplete";
const fullWidth = "500px"; // Component size when opened
const collapsedWidth = "288px"; // Component size when collapsed/closed
const TextFieldWithCursorPosition = withCursorPosition(TextField);
const typedAcceleratorRegex = /\bin:(media|code|schema|content)\b/gi;

export interface Suggestion {
  type: ResourceType;
  ZUID: string;
  title: string;
  updatedAt: string;
  url: string;
  noUrlErrorMessage?: string;
  subType?: string;
}

export const GlobalSearch = () => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [chipSearchAccelerator, setChipSearchAccelerator] =
    useState<ResourceType | null>(null);
  const [typedSearchAccelerator, setTypedSearchAccelerator] =
    useState<ResourceType | null>(null);
  const [open, setOpen] = useState(false);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [recentSearches, addSearchTerm, deleteSearchTerm] = useRecentSearches();
  const [models, setModelKeyword] = useSearchModelsByKeyword();
  const [codeFiles, setFileKeyword] = useSearchCodeFilesByKeywords();
  const [mediaFolders, setMediaFolderKeyword] =
    useSearchMediaFoldersByKeyword();
  const languages = useSelector((state: any) => state.languages);
  const { mainApp } = useGetActiveApp();
  const instanceId = useSelector((state: any) => state.instance.ID);
  const ecoId = useSelector((state: any) => state.instance.ecoID);
  const history = useHistory();
  const dispatch = useDispatch();
  const [params, setParams] = useParams();
  const textfieldRef = useRef<HTMLDivElement>();

  const apiQueryTerm = useMemo(() => {
    if (!!typedSearchAccelerator && !!searchKeyword) {
      // Remove the accelerator from the keyword
      return searchKeyword.replace(typedAcceleratorRegex, "")?.trim();
    }

    return searchKeyword;
  }, [searchKeyword]);

  const {
    data: contents,
    isError: isContentFetchingFailed,
    isFetching: isFetchingContentSearchResults,
  } = useSearchContentQuery({ query: apiQueryTerm });

  const { data: bins } = useGetBinsQuery({ instanceId, ecoId });
  const { data: mediaFiles, isFetching: isFetchingMediaSearchResults } =
    useSearchBinFilesQuery(
      { binIds: bins?.map((bin) => bin.id), term: apiQueryTerm },
      {
        skip: !bins?.length || !apiQueryTerm,
      }
    );
  const { data: allMediaFiles, isFetching: isFetchingAllMediaFiles } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );

  const isLoading =
    isFetchingAllMediaFiles ||
    isFetchingMediaSearchResults ||
    isFetchingContentSearchResults;

  const suggestions: Suggestion[] = useMemo(() => {
    // Content data needs to be reset to [] when api call fails
    const contentSuggestions: Suggestion[] =
      isContentFetchingFailed || isEmpty(contents)
        ? []
        : contents?.map((content) => {
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
          });

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
      codeFiles?.map((file) => {
        return {
          type: "code",
          ZUID: file.ZUID,
          title: file.fileName?.split("/").pop(), // Removes the file path from the file name
          updatedAt: file.updatedAt,
          url: `/code/file/views/${file.ZUID}`,
        };
      }) || [];

    // Need to show all the media files when the media accelerator is active and there's no user input
    const mediaSource =
      chipSearchAccelerator === "media" && !searchKeyword
        ? allMediaFiles
        : mediaFiles;
    const mediaFileSuggestions: Suggestion[] =
      mediaSource?.map((file) => {
        return {
          type: "media",
          subType: "item",
          ZUID: file.id,
          title: file.filename,
          updatedAt: file.updated_at,
          url: `/media?fileId=${file.id}`,
        };
      }) || [];

    const mediaFolderSuggestions: Suggestion[] =
      mediaFolders?.map((folder) => {
        return {
          type: "media",
          subType: "folder",
          ZUID: folder.id,
          title: folder.name,
          updatedAt: "",
          url: `/media/folder/${folder.id}`,
        };
      }) || [];

    let consolidatedResults = [
      ...contentSuggestions,
      ...modelSuggestions,
      ...codeFileSuggestions,
      ...mediaFileSuggestions,
      ...mediaFolderSuggestions,
    ];

    const activeAccelerator = chipSearchAccelerator ?? typedSearchAccelerator;

    // Only show related suggestions when a search accelerator is active
    switch (activeAccelerator) {
      case "code":
        consolidatedResults = [...codeFileSuggestions];
        break;

      case "content":
        consolidatedResults = [...contentSuggestions];
        break;

      case "schema":
        consolidatedResults = [...modelSuggestions];
        break;

      case "media":
        consolidatedResults = [
          ...mediaFileSuggestions,
          ...mediaFolderSuggestions,
        ];
        break;

      default:
        break;
    }

    return consolidatedResults.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [
    contents,
    models,
    codeFiles,
    mediaFiles,
    mediaFolders,
    isContentFetchingFailed,
    chipSearchAccelerator,
    allMediaFiles,
  ]);

  const options = useMemo(() => {
    // Only show the first 5 recent searches when user has not typed in a query
    const _recentSearches =
      recentSearches?.length && !searchKeyword
        ? ["RecentSearches", ...recentSearches.slice(0, 5)]
        : [];
    // Shows the suggestions when either a search keyword is entered or a search accelerator is activated
    let _suggestions =
      suggestions?.length &&
      (Boolean(searchKeyword) || Boolean(chipSearchAccelerator))
        ? suggestions?.slice(0, 5)
        : [];

    // These are just dummy data to render 5 skeleton loaders when there are ongoing api calls
    if (isLoading && Boolean(searchKeyword)) {
      _suggestions = [...new Array(5)].map((index) => {
        return {
          type: "media",
          ZUID: index,
          title: "",
          updatedAt: "",
          url: "",
        };
      });
    }

    /** Note: The order of items in this array control the order of how the
     * options will be rendered in the autocomplate dropdown
     */
    return [
      searchKeyword,
      "SearchAccelerator",
      "RecentModifiedItemsHeader",
      ..._suggestions,
      ..._recentSearches,
      "AdvancedSearchButton",
    ];
  }, [suggestions, recentSearches, searchKeyword]);

  useEffect(() => {
    setModelKeyword(apiQueryTerm);
    setFileKeyword(apiQueryTerm);
    setMediaFolderKeyword(apiQueryTerm);
  }, [apiQueryTerm]);

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });

  const getTypedSearchAccelerator = (source: string) => {
    const match = source?.match(typedAcceleratorRegex);

    return match?.length ? match[0] : null;
  };

  const goToSearchPage = (queryTerm: string, resourceType?: ResourceType) => {
    const isOnSearchPage = mainApp === "search";
    const typedAccelerator = getTypedSearchAccelerator(queryTerm);

    const q =
      !!typedAccelerator && !resourceType
        ? queryTerm.replace(typedAcceleratorRegex, "").trim()
        : queryTerm;
    const resource =
      resourceType ?? typedAccelerator?.split(":")[1].toLowerCase();
    const searchParams = new URLSearchParams({
      q,
      ...(!!resource && { resource }),
    });
    const url = `/search?${searchParams.toString()}`;

    // Do not save term as a recent keyword if it's empty
    if (!!queryTerm.trim()) {
      // If the user has selected a search accelerator, also save it in
      // the format of `[in:RESOURCE_TYPE]`
      addSearchTerm(
        !!resourceType ? `[in:${resourceType}] ${queryTerm}` : queryTerm
      );
    }

    setOpen(false);
    textfieldRef.current?.querySelector("input").blur();

    if (queryTerm !== searchKeyword) {
      // Makes sure that the textfield search keyword gets updated if the user has clicked on a recent search item
      setSearchKeyword(queryTerm);
    }

    if (resourceType !== chipSearchAccelerator) {
      // Makes sure that the search accelerator is updated if the user has clicked on a recent search item
      setChipSearchAccelerator(resourceType);
    }

    // Only add the search page on the history stack during initial page visit
    // Makes sure clicking close on the search page brings the user back to the previous page
    if (isOnSearchPage) {
      history.replace(url);
    } else {
      history.push(url);
    }
  };

  return (
    <>
      <Collapse
        in
        collapsedSize={collapsedWidth}
        orientation="horizontal"
        sx={{
          zIndex: 2,
          height: "40px",
          position: "relative",
          "& .MuiCollapse-entered": {
            width: fullWidth,
          },
        }}
      >
        <Autocomplete
          value={searchKeyword}
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
                  width: fullWidth,
                }}
              />
            );
          }}
          id={ElementId}
          openOnFocus
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          blurOnSelect
          options={options}
          filterOptions={(x) => x}
          sx={{
            height: "40px",
            width: open ? fullWidth : collapsedWidth,
            "& .MuiOutlinedInput-root": {
              py: "2px",
            },
            boxSizing: "border-box",
            "& .MuiFormControl-root": {
              gap: "10px",
            },
            "&.Mui-focused .MuiAutocomplete-clearIndicator": {
              visibility: searchKeyword ? "visible" : "hidden",
            },
          }}
          onInputChange={(_, newVal) => {
            let keyword = newVal;
            const typedAccelerator = getTypedSearchAccelerator(newVal);

            if (!!newVal && !!typedAccelerator) {
              const resourceType = typedAccelerator
                .split(":")[1]
                .toLowerCase() as ResourceType;
              setTypedSearchAccelerator(resourceType);
            } else {
              setTypedSearchAccelerator(null);
            }

            setSearchKeyword(keyword);
          }}
          onChange={(_, newVal) => {
            /** This is when the user selects any of the suggestions */

            // null represents "X" button clicked
            if (!newVal) {
              setSearchKeyword("");
              return;
            }

            // string represents search term entered
            if (typeof newVal === "string") {
              if (AdditionalDropdownOptions.includes(newVal)) {
                return;
              }

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
            // do not change the input search keyword when a suggestion is selected
            return searchKeyword;
          }}
          renderOption={(props, option) => {
            // TODO: Maybe extract into some kind of template object for readability
            if (typeof option === "string") {
              // Renders the keyword search term & recent items
              if (!AdditionalDropdownOptions.includes(option)) {
                // Checks if this is the keyword search term
                const isSearchTerm = props.id === `${ElementId}-option-0`;

                if (isSearchTerm) {
                  if (!Boolean(searchKeyword)) {
                    return;
                  }

                  return (
                    <KeywordSearchItem
                      {...props}
                      // HACK: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
                      aria-selected={false}
                      key={option}
                      onItemClick={() =>
                        goToSearchPage(option, chipSearchAccelerator)
                      }
                      text={option}
                      searchAccelerator={chipSearchAccelerator}
                      recentSearches={recentSearches}
                    />
                  );
                } else {
                  if (Boolean(chipSearchAccelerator)) {
                    return;
                  }

                  return (
                    <RecentSearchItem
                      {...props}
                      // HACK: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
                      aria-selected={false}
                      key={option}
                      onItemClick={(term, resourceType) =>
                        goToSearchPage(term, resourceType)
                      }
                      onRemove={deleteSearchTerm}
                      text={option}
                    />
                  );
                }
              }

              // Renders the recent searches component
              // This only renders the subheader, actual data is being set on the suggestions array
              // and rendering of the list is done above
              if (option === "RecentSearches" && !chipSearchAccelerator) {
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

              // Renders the search accelerators when no search accelerator is active & there is no search term
              if (
                option === "SearchAccelerator" &&
                !Boolean(chipSearchAccelerator) &&
                !Boolean(searchKeyword)
              ) {
                return (
                  <SearchAccelerator
                    {...props}
                    key="SearchAccelerator"
                    onAcceleratorClick={(type) =>
                      setChipSearchAccelerator(type)
                    }
                  />
                );
              }

              // Renders the recently modified items list subheader when an
              // accelerator is active and there is no user input
              if (
                option === "RecentModifiedItemsHeader" &&
                Boolean(chipSearchAccelerator) &&
                !Boolean(searchKeyword)
              ) {
                const types: Record<ResourceType, string> = {
                  code: "Code Files",
                  content: "Content Items",
                  schema: "Models in Schema",
                  media: "Media Items",
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
                    Recent Modified {types[chipSearchAccelerator]}
                  </ListSubheader>
                );
              }
            } else {
              // Renders the dummy data as skeleton loaders when an api call is ongoing
              if (isLoading) {
                return (
                  <ListItem
                    {...props}
                    sx={{
                      height: 32,
                    }}
                    key={option.ZUID}
                    onClick={() => {}}
                  >
                    <Skeleton width="100%" />
                  </ListItem>
                );
              }

              // Renders the suggestion items
              return (
                <GlobalSearchItem
                  {...props}
                  key={option.ZUID}
                  icon={getItemIcon(option.type, option.subType ?? "")}
                  text={option.title}
                />
              );
            }
          }}
          renderInput={(params: any) => {
            return (
              <TextFieldWithCursorPosition
                {...params}
                ref={textfieldRef}
                fullWidth
                data-cy="global-search-textfield"
                variant="outlined"
                placeholder={
                  Boolean(chipSearchAccelerator)
                    ? ""
                    : `Search Instance ${shortcutHelpText}`
                }
                sx={{
                  height: "40px",
                  "& .Mui-focused": {
                    width: fullWidth,
                  },
                  "&:hover .MuiButtonBase-root.MuiAutocomplete-clearIndicator":
                    {
                      visibility: searchKeyword ? "visible" : "hidden",
                    },
                  "& .MuiButtonBase-root.MuiAutocomplete-clearIndicator": {
                    visibility: searchKeyword ? "visible" : "hidden",
                  },
                  ".MuiAutocomplete-endAdornment": {
                    position: "initial",
                  },
                  "& .MuiInputBase-root.MuiAutocomplete-inputRoot.MuiOutlinedInput-root":
                    {
                      pr: "0px",
                    },
                }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" && Boolean(searchKeyword)) {
                    goToSearchPage(searchKeyword, chipSearchAccelerator);
                  }

                  // Remove the selected search accelerator when the user presses backspace and there's no search keyword
                  if (
                    e.key === "Backspace" &&
                    !Boolean(searchKeyword) &&
                    Boolean(chipSearchAccelerator)
                  ) {
                    setChipSearchAccelerator(null);
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
                      {Boolean(chipSearchAccelerator) && open ? (
                        <Chip
                          data-cy={`active-global-search-accelerator-${chipSearchAccelerator}`}
                          variant="filled"
                          label={`in: ${SEARCH_ACCELERATORS[chipSearchAccelerator]?.text}`}
                          color="primary"
                          size="small"
                          onDelete={() => setChipSearchAccelerator(null)}
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
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setIsAdvancedSearchOpen(true);
                          }}
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
                    backgroundColor: "background.paper",
                  },
                }}
              />
            );
          }}
          ListboxProps={{
            style: {
              paddingTop: searchKeyword ? "8px" : "0px",
            },
          }}
        />
      </Collapse>

      {isAdvancedSearchOpen && (
        <AdvancedSearch
          keyword={searchKeyword}
          onClose={() => setIsAdvancedSearchOpen(false)}
          onSearch={(searchData) => {
            if (!!searchData.keyword?.trim()) {
              addSearchTerm(searchData.keyword);
            }
          }}
          searchAccelerator={chipSearchAccelerator}
        />
      )}
    </>
  );
};
