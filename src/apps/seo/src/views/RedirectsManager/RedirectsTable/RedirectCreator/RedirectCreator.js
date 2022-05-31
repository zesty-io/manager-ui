import { useState } from "react";
import cx from "classnames";

import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";

import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Select, Option } from "@zesty-io/core/Select";
import { Search } from "@zesty-io/core/Search";

import { createRedirect } from "../../../../store/redirects";
import RedirectsImport from "../../../RedirectsManager/RedirectActions/RedirectsImport/RedirectsImport";

import { CSVImporter } from "../../../../../src/store/imports";

import ContentSearch from "shell/components/ContentSearch";

import styles from "./RedirectCreator.less";

export function RedirectCreator(props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState(1); // Toggle defaults to 301
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
          code: code === 1 ? 301 : 302, // API expects a 301/302 value
        })
      )
      .then(() => {
        setFrom("");
        setTo("");
        setContentSearchValue("");
      });
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
        <ToggleButton
          className={styles.code}
          name="redirectType"
          value={code}
          offValue="302"
          onValue="301"
          onChange={(val) => setCode(Number(val))}
        />
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
          <Search
            className={cx(styles.SearchBar, styles.InputSearch)}
            onChange={determineTerm}
            placeholder={type === "external" ? "Add URL" : "Add File Path"}
            defaultValue={to}
          />
        )}
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
      <span className={styles.RedirectCreatorCell}>
        <RedirectsImport
          onChange={(evt) => {
            props.dispatch(CSVImporter(evt));
          }}
        />
      </span>
    </div>
  );
}
