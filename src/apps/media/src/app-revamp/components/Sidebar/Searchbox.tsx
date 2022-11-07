import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useHistory } from "react-router";
import { KeyboardEvent, useEffect, useState, useRef } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";

export const SearchBox = () => {
  const history = useHistory();
  const [params] = useParams();
  const inputRef = useRef<HTMLInputElement>();
  const term = (params as URLSearchParams).get("term");
  const clearAndFocus = (params as URLSearchParams).get("cf");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  useEffect(() => {
    if (clearAndFocus && inputRef.current) {
      setSearchTerm("");
      inputRef.current?.focus();
    }
  }, [clearAndFocus]);

  return (
    <TextField
      sx={{ mt: 1.5 }}
      placeholder="Search Media"
      hiddenLabel
      size="small"
      value={searchTerm}
      inputProps={{ ref: inputRef }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
        endAdornment: searchTerm ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setSearchTerm("")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
        e.key === "Enter" &&
        (e.target as HTMLInputElement).value &&
        history.push(
          `/media/search?term=${(e.target as HTMLInputElement).value.replaceAll(
            " ",
            "-"
          )}`
        )
      }
    />
  );
};
