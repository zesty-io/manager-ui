import { useState } from "react";
import {
  Button,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { createRedirect } from "../../../../store/redirects";
import RedirectsImport from "../../../RedirectsManager/RedirectActions/RedirectsImport/RedirectsImport";

import { CSVImporter } from "../../../../../src/store/imports";

import ContentSearch from "shell/components/ContentSearch";

import styles from "./RedirectCreator.less";

export function RedirectCreator(props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState(301); // Toggle defaults to 301
  const [type, setType] = useState("page");
  const [contentSearchValue, setContentSearchValue] = useState("");

  const determineTerm = (term) => {
    // ContentSearch return Object while Search return string
    let contentSearchValue = term?.meta ? term.web.path : term;
    setContentSearchValue(contentSearchValue);

    term = term.meta ? term.meta.ZUID : term;
    setTo(term);
  };

  const handleCreateRedirect = () => {
    props
      .dispatch(
        createRedirect({
          path: from,
          targetType: type,
          target: to,
          code, // API expects a 301/302 value
        })
      )
      .then(() => {
        setFrom("");
        setTo("");
        setContentSearchValue("");
      });
  };

  const handleToggle = (val) => {
    if (val === null) return;
    setCode(val);
  };

  return (
    <div className={styles.RedirectCreator}>
      <span className={styles.RedirectCreatorCell}>
        <TextField
          name="redirectFrom"
          type="text"
          value={from}
          placeholder="URL path to redirect from"
          onChange={(evt) => setFrom(evt.target.value)}
          error={!!from.length && !from.startsWith("/")}
          size="small"
          variant="outlined"
          color="primary"
          fullWidth
        />
      </span>
      <span className={styles.RedirectCreatorCell}>
        <ToggleButtonGroup
          color="secondary"
          value={code}
          size="small"
          exclusive
          onChange={(evt, val) => handleToggle(val)}
        >
          <ToggleButton value={302}>302</ToggleButton>
          <ToggleButton value={301}>301</ToggleButton>
        </ToggleButtonGroup>
      </span>
      <span className={styles.RedirectCreatorCell}>
        <Select
          name={"selectType"}
          onChange={(e) => setType(e.target.value)}
          value={type}
          size="small"
          fullWidth
        >
          <MenuItem value="page" text="Internal">
            Internal
          </MenuItem>
          <MenuItem value="external" text="External">
            External
          </MenuItem>
          <MenuItem value="path" text="Wildcard">
            Wildcard
          </MenuItem>
        </Select>
      </span>
      <span className={styles.RedirectCreatorCell}>
        {type === "page" ? (
          <ContentSearch
            className={styles.SearchBar}
            placeholder="Search for item"
            onSelect={determineTerm}
            filterResults={(results) =>
              results.filter((result) => result.web.path !== null)
            }
            value={contentSearchValue}
          />
        ) : (
          <TextField
            placeholder={type === "external" ? "Add URL" : "Add File Path"}
            type="search"
            variant="outlined"
            size="small"
            fullWidth
            defaultValue={to}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            onChange={(evt) => {
              const term = evt.target.value;
              determineTerm(term);
            }}
          />
        )}
      </span>

      <span className={styles.RedirectCreatorCell}>
        <RedirectsImport
          onChange={(evt) => {
            props.dispatch(CSVImporter(evt));
          }}
        />
      </span>
      <span className={styles.RedirectCreatorCell}>
        <Button
          variant="contained"
          color="success"
          onClick={handleCreateRedirect}
          disabled={!from.length || !from.startsWith("/")}
          startIcon={<AddIcon />}
        >
          Create Redirect
        </Button>
      </span>
    </div>
  );
}
