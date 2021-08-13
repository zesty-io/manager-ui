import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { ToggleButton } from "@zesty-io/core/ToggleButton";
import { Search } from "@zesty-io/core/Search";
import { Select, Option } from "@zesty-io/core/Select";

import { createRedirect } from "../../../../store/redirects";
import RedirectsImport from "../../../RedirectsManager/RedirectActions/RedirectsImport/RedirectsImport";

import { CSVImporter } from "../../../../../src/store/imports";
import { notify } from "shell/store/notifications";

import ContentSearch from "shell/components/ContentSearch";

import styles from "./RedirectCreator.less";

export function RedirectCreator(props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState(1); // Toggle defaults to 301
  const [type, setType] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [showInputExternal, setShowInputExternal] = useState(false);
  const [showInputPath, setShowInputPath] = useState(false);

  const determineTerm = (term) => {
    // ContentSearch return Object while Search return string
    term = term.meta ? term.meta.ZUID : term;
    setTo(term);
  };

  const selectTypeHandler = (selectType) => {
    if (selectType === "internalPage") {
      setShowInputExternal(false);
      setShowInputPath(false);

      setShowFilter(true);
      return setType("page");
    }
    if (selectType === "externalPage") {
      setShowFilter(false);
      setShowInputPath(false);

      setShowInputExternal(true);
      return setType("external");
    }

    if (selectType === "relativePath") {
      setShowFilter(false);
      setShowInputExternal(false);

      setShowInputPath(true);
      return setType("path");
    }
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
        <div>
          <Select name={"selectType"} onSelect={selectTypeHandler}>
            <Option value="internalPage" text="Internal Page" />
            <Option value="externalPage" text="External Page" />
            <Option value="relativePath" text="Relative Path" />
          </Select>
        </div>
      </span>
      <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
        {showFilter && (
          <ContentSearch
            className={styles.SearchBar}
            placeholder="Search for item"
            onSelect={determineTerm}
            filterResults={(results) =>
              results.filter((result) => result.web.path !== null)
            }
            value={to}
          />
        )}

        {showInputExternal && (
          <Search
            className={styles.SearchBar}
            onChange={determineTerm}
            value={to}
          />
        )}

        {showInputPath && (
          <Search
            className={styles.SearchBar}
            onChange={determineTerm}
            value={to}
          />
        )}
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
