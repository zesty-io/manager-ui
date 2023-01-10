import TextField from "@mui/material/TextField";
import { FC, useState, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";
import { MenuItem, MenuList, ListItemIcon, ListItemText } from "@mui/material";
import PencilIcon from "@mui/icons-material/Create";
import { useMetaKey } from "../../../shell/hooks/useMetaKey";
import { useSearchContentQuery } from "../../services/instance";

// input with a search icon and "search instance" placeholder text

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");

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
  console.log(res);

  const suggestions = res.data;
  const topSuggestions = suggestions && suggestions.slice(0, 4);
  console.log(value, suggestions);

  //@ts-ignore TODO fix typing for useMetaKey
  const thing = useMetaKey("k", () => {
    focus({ currentTarget: textfieldRef });
  });

  // options={topSuggestions ? topSuggestions.map(s => s.web.metaTitle) : []}
  return (
    <Autocomplete
      id="global-search-autocomplete"
      value={value}
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
