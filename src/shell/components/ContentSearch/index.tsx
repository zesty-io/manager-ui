import TextField from "@mui/material/TextField";
import { FC, useState, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";
import {
  MenuItem,
  MenuList,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";
import { ContentItem } from "../../services/types";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { notify } from "../../store/notifications";

// input with a search icon and "search instance" placeholder text

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();

  //POPPER stuff
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const textfieldRef = useRef<HTMLDivElement>(null);

  const focus = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const blur = () => {
    //setAnchorEl(null);
  };
  const selected = (event: any) => {
    console.log("Selected", event.currentTarget.innerText);
    inputRef.current.focus();
  };
  const focused = (event: any) => {
    console.log("Focused", event.currentTarget.innerText);
  };

  const id = "search-popover";

  /*
  const suggestions = [
    "Suggestion 1",
    "Suggestion 2",
    "Suggestion 3",
    "Suggestion 4",
  ] as const; //TODO RTK query
  */
  const res = useSearchContentQuery({ query: value }, { skip: !value });
  console.log("rtk response", res);

  const suggestions = res.data;
  const topSuggestions =
    suggestions && value ? [value, ...suggestions.slice(0, 5)] : [];
  console.log({ value, suggestions });

  //@ts-ignore TODO fix typing for useMetaKey
  const thing = useMetaKey("k", () => {
    focus({ currentTarget: textfieldRef });
  });

  // options={topSuggestions ? topSuggestions.map(s => s.web.metaTitle) : []}
  return (
    <Autocomplete
      value={value}
      fullWidth
      id="global-search-autocomplete"
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={topSuggestions}
      filterOptions={(x) => x}
      onInputChange={(event, newVal) => {
        console.log("onInputChange", { event, newVal });
        setValue(newVal);
      }}
      onChange={(event, newVal) => {
        console.log("onChange", { event, newVal });
        // null represents "X" button clicked
        if (!newVal) {
          setValue("");
          return;
        }
        // string represents search term entered
        if (typeof newVal === "string") {
          history.push(`/search?q=${newVal}`);
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
        console.log("getOptionLabel", { option, suggestions, value });
        // do not change the input value when a suggestion is selected
        return value;
      }}
      renderOption={(props, option) => {
        console.log("renderOption", option, props);
        // type of string represents the top-row search term
        if (typeof option === "string")
          return (
            <ListItem
              {...props}
              // Hacky: aria-selected is required for accessibility but the underlying component is not setting it correctly for the top row
              aria-selected={false}
              key={"topline"}
              sx={{
                padding: "4px 16px 4px 16px",
                height: "36px",
                "&.Mui-focused": {
                  borderLeft: (theme) =>
                    "4px solid " + theme.palette.primary.main,
                  padding: "4px 16px 4px 12px",
                },
              }}
            >
              <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
                <SearchIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={option}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          );
        // type of ContentItem represents a suggestion from the search API
        else {
          return (
            <ListItem
              {...props}
              key={option.meta.ZUID}
              sx={{
                padding: "4px 16px 4px 16px",
                height: "36px",
                "&.Mui-focused": {
                  borderLeft: (theme) =>
                    "4px solid " + theme.palette.primary.main,
                  padding: "4px 16px 4px 12px",
                },
              }}
            >
              <ListItemIcon sx={{ width: "32px", minWidth: "32px" }}>
                <PencilIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={option.web.metaTitle}
                primaryTypographyProps={{ variant: "body2" }}
              />
            </ListItem>
          );
        }
      }}
      renderInput={(params: any) => {
        console.log("renderInput");
        return (
          <TextField
            {...params}
            fullWidth
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("Enter pressed", e);
                history.push(`/search?q=${value}`);
              }
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon fontSize="small" />,
              sx: {
                borderRadius: 1,
                padding: "6px 8px",
                gap: "10px",
                width: "100%",
                backgroundColor: (theme) => theme.palette.background.paper,
              },
            }}
            sx={{
              gap: "10px",
            }}
          />
        );
      }}
    />
  );
};

export default ContentSearch;

type SuggestionProps = {
  suggestion: string;
  onClick: (event: any) => void;
  onFocus: (event: any) => void;
};
const Suggestion: FC<SuggestionProps> = ({ suggestion, onClick, onFocus }) => (
  <MenuItem
    key={suggestion}
    onClick={onClick}
    onFocus={onFocus}
    sx={{ height: "36px" }}
  >
    <ListItemIcon>
      <PencilIcon fontSize="small" />
    </ListItemIcon>
    <ListItemText primary={suggestion} />
  </MenuItem>
);
