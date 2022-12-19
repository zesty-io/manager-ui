import TextField from "@mui/material/TextField";
import { FC, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

// input with a search icon and "search instance" placeholder text

const ContentSearch: FC = () => {
  const [value, setValue] = useState("");
  return (
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
    />
  );
};

export default ContentSearch;
