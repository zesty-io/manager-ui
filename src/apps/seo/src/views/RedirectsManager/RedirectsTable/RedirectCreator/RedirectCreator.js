import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";
import { Input } from "@zesty-io/core/Input";
import { ToggleButton } from "@zesty-io/core/ToggleButton";

import { createRedirect } from "../../../../store/redirects";

import styles from "./RedirectCreator.less";
import ContentSearch from "shell/components/ContentSearch";

export function RedirectCreator(props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [code, setCode] = useState(1); // Toggle defaults to 301

  const handleCreateRedirect = () => {
    props
      .dispatch(
        createRedirect({
          path: from,
          targetType: "path",
          target: to,
          code: code === 1 ? 301 : 302 // API expects a 301/302 value
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
          onChange={evt => setFrom(evt.target.value)}
        />
      </span>
      <span className={styles.RedirectCreatorCell}>
        <ToggleButton
          className={styles.code}
          name="redirectType"
          value={code}
          offValue="302"
          onValue="301"
          onChange={val => setCode(Number(val))}
        />
      </span>
      <span className={styles.RedirectCreatorCell} style={{ flex: "1" }}>
        <ContentSearch
          className={styles.SearchBar}
          placeholder="Search for item"
          onSelect={item => {
            setTo(item.web.path);
          }}
          filterResults={results =>
            results.filter(result => result.web.path !== null)
          }
          value={to}
        />
      </span>
      <span className={styles.RedirectCreatorCell}>
        <Button className="save" kind="save" onClick={handleCreateRedirect}>
          <FontAwesomeIcon icon={faPlus} />
          Create Redirect
        </Button>
      </span>
    </div>
  );
}
