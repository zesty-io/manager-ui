import TextField from "@mui/material/TextField";
import { FC, useState, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import { MenuItem, MenuList } from "@mui/material";
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
    setAnchorEl(null);
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
  const res = useSearchContentQuery({ query: value });
  console.log(res);

  const suggestions = res.data || [];

  //@ts-ignore TODO fix typing for useMetaKey
  const thing = useMetaKey("k", () => {
    focus({ currentTarget: textfieldRef });
  });

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
            {suggestions.map((suggestion) => (
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
  <MenuItem key={suggestion} onClick={onClick} onFocus={onFocus}>
    {suggestion}
  </MenuItem>
);
