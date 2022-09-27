import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useHistory } from "react-router";
import { KeyboardEvent, useEffect, useState } from "react";
import { useParams } from "../../../../../../shell/hooks/useParams";

export const SearchBox = () => {
  const history = useHistory();
  const [params] = useParams();
  const term = (params as URLSearchParams).get("term");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSearchTerm(term || "");
  }, [term]);

  return (
    <TextField
      sx={{ mt: 1.5 }}
      placeholder="Search Media"
      hiddenLabel
      size="small"
      value={searchTerm}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
        e.key === "Enter" &&
        (e.target as HTMLInputElement).value &&
        history.push(
          `/media/search?term=${(e.target as HTMLInputElement).value}`
        )
      }
    />
  );
};
