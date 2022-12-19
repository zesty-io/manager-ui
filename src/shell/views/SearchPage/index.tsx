import { FC } from "react";

import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

import { useParams } from "../../../shell/hooks/useParams";
import { Typography } from "@mui/material";

export const SearchPage: FC = () => {
  const [params, setParams] = useParams();
  const query = params.get("q");
  console.log("query", query);
  return <Typography variant="h1">Search for {query}</Typography>;
};
