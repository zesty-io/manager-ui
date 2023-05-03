import { FC, useState, useRef, useReducer } from "react";
import SearchIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import { HTMLAttributes } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  Autocomplete,
  Paper,
  Popper,
  Collapse,
  IconButton,
} from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { useHistory, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { notify } from "../../store/notifications";
import { useTheme } from "@mui/material/styles";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { AdvancedSearch } from "./components/AdvancedSearch";

// The order here matters as this is how it will be rendered as well
const AdditionalDropdownOptions = ["RecentSearches", "AdvancedSearchButton"];

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const textfieldRef = useRef<HTMLDivElement>();

  const res = useSearchContentQuery({ query: value }, { skip: !value });

  const suggestions = res.data;
  const topSuggestions =
    suggestions && value
      ? [value, ...suggestions.slice(0, 5), ...AdditionalDropdownOptions]
      : [...AdditionalDropdownOptions];

  //@ts-ignore TODO fix typing for useMetaKey
  const shortcutHelpText = useMetaKey("k", () => {
    textfieldRef.current?.querySelector("input").focus();
  });
  const languages = useSelector((state: any) => state.languages);
  const [open, setOpen] = useState(false);

  const theme = useTheme();

  const goToSearchPage = (queryTerm: string) => {
    const isOnSearchPage = location.pathname === "/search";

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
                  borderWidth: topSuggestions?.length
                    ? "0px 1px 1px 1px"
                    : "0px",
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
          id="global-search-autocomplete"
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          blurOnSelect
          options={topSuggestions}
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
              // Represents the top-row search term
              if (!AdditionalDropdownOptions.includes(option)) {
                return (
                  <Suggestion
                    {...props}
                    // Hacky: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
                    aria-selected={false}
                    key={"global-search-term"}
                    icon="search"
                    onClick={() => goToSearchPage(option)}
                    text={option}
                  />
                );
              }

              // Renders the recent searches component
              if (option === "RecentSearches") {
                return <ListItem>Recent Searches</ListItem>;
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
                <Suggestion
                  {...props}
                  key={option.meta.ZUID}
                  icon="pencil"
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
        />
      )}
    </>
  );
};

export default ContentSearch;

type SuggestionProps = HTMLAttributes<HTMLLIElement> & {
  text: string;
  icon: "search" | "pencil";
};
const Suggestion: FC<SuggestionProps> = ({ text, icon, ...props }) => {
  const Icon = icon === "search" ? SearchIcon : PencilIcon;
  return (
    <ListItem
      {...props}
      sx={{
        "&.MuiAutocomplete-option": {
          padding: "4px 16px 4px 16px",
        },
        minHeight: "36px",
        "&.Mui-focused": {
          borderLeft: (theme) => "4px solid " + theme.palette.primary.main,
          padding: "4px 16px 4px 12px",
        },
      }}
    >
      <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={text}
        primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
      />
    </ListItem>
  );
};
