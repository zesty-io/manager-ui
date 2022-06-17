import { useState } from "react";

import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { Select, Option } from "@zesty-io/core/Select";

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
        <Select name={"selectType"} onSelect={setType} value={type}>
          <Option value="page" selected text="Internal" />
          <Option value="external" text="External" />
          <Option value="path" text="Wildcard" />
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
              let term = evt.target.value;
              if (term === null) return;
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
