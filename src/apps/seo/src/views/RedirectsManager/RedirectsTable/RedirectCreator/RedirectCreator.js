import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
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

  const determineTerm = (term) => {
    // ContentSearch return Object while Search return string
    term = term.meta ? term.meta.ZUID : term;
    setTo(term);
  };

  const renderSearch = () => {
    if (type === "page") {
      return (
        <ContentSearch
          className={styles.SearchBar}
          placeholder="Search for item"
          onSelect={determineTerm}
          filterResults={(results) =>
            results.filter((result) => result.web.path !== null)
          }
          value={to}
        />
      );
    }
    return (
      <Search
        className={styles.SearchBar}
        onChange={determineTerm}
        placeholder={type === "external" ? "Add URL" : "Add File Path"}
        value={to}
      />
    );
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
      });
  };

  return (
    <div className={styles.RedirectCreator}>
      <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
        <Input
          className={styles.from}
          name="redirectFrom"
          type="text"
          value={from}
          placeholder="URL path to redirect from"
          onChange={(evt) => setFrom(evt.target.value)}
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
      <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
        {renderSearch()}
      </span>
      <span className={styles.RedirectCreatorCell}>
        <Button className="save" kind="save" onClick={handleCreateRedirect}>
          <FontAwesomeIcon icon={faPlus} />
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
