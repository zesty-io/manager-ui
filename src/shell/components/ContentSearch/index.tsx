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
      open={true}
      fullWidth
      id="global-search-autocomplete"
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={topSuggestions}
      filterOptions={(x) => x}
      onInputChange={(event, newVal) => {
        setValue(newVal);
        console.log("onInputChange", { event, newVal });
        if (event?.type === "change") {
          console.log("onInputChange change");
        } else if (event?.type === "keydown") {
          console.log("onInputChange keydown", newVal);
        }
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
              sx={{ padding: "4px 16px 4px 16px" }}
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
        else {
          return (
            <ListItem {...props} key={option.meta.ZUID}>
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
  /*
return (
  <Autocomplete
    id="global-search-autocomplete"
    value={value}
    inputValue={value}
    freeSolo
    options={["option 1", "option 2", "option 3"]}
    filterOptions={(x) => x}
    onInputChange={(thing, newVal) => {
      console.log("change");
      console.log({ thing, newVal });
      setValue(newVal);
    }}
    renderOption={(props, option) => {
      console.log("rendering option", option, props);
      return <li {...props}>{option} </li>;
    }}
    renderInput={(params: any) => {
      console.log("input rendered");
      return (
        <TextField
          {...params}
          fullWidth
          sx={{
            gap: "10px",
          }}
          InputProps={{
            label: "Search instance",
            type: "search",
            startAdornment: <SearchIcon fontSize="small" />,
            endAdornment: <TuneIcon fontSize="small" />,
            sx: {
              borderRadius: 1,
              padding: "6px 8px",
              gap: "10px",
            },
          }}
        />
      );
    }}
  />
);

return (
  <>
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search instance"
      fullWidth
      InputProps={{
        startAdornment: <SearchIcon fontSize="small" />,
        endAdornment: <TuneIcon fontSize="small" />,
        sx: {
          borderRadius: 1,
          padding: "6px 8px",
          gap: "10px",
        },
      }}
      sx={{
        gap: "10px",
      }}
      onFocus={focus}
      onBlur={blur}
      inputRef={inputRef}
      ref={textfieldRef}
    />
    <Popper
      id={id}
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      style={{ zIndex: 1000 }}
      sx={{
        width: textfieldRef?.current?.clientWidth,
      }}
      placement="bottom-start"
    >
      <Paper elevation={3}>
        <MenuList>
          <MenuItem
            onClick={selected}
            onFocus={focused}
            sx={{ height: "36px" }}
          >
            <ListItemIcon>
              <SearchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={value} />
          </MenuItem>
          {topSuggestions &&
            topSuggestions.map((suggestion) => (
              <Suggestion
                key={suggestion.meta.ZUID}
                onClick={selected}
                onFocus={focused}
                suggestion={suggestion.web.metaTitle}
              />
            ))}
        </MenuList>
      </Paper>
    </Popper>
  </>
);
*/
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
