import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Nav } from "@zesty-io/core/Nav";
import { Search } from "@zesty-io/core/Search";
import { Button } from "@zesty-io/core/Button";

import styles from "./SchemaNav.less";
export default function SchemaNav(props) {
  let history = useHistory();

  const [nav, setNav] = useState(props.nav);
  const [selected, setSelected] = useState(window.location.hash);

  const handleHashChange = () => {
    if (window.location.hash !== selected) {
      setSelected(window.location.hash);
    }
  };

  useEffect(() => {
    setNav(props.nav);
  }, [props.nav]);

  useEffect(() => {
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  });

  return (
    <nav className={cx("SchemaNav", styles.SchemaNav)}>
      <div className={styles.Actions}>
        <Button onClick={() => history.push("/schema/new")} type="save">
          <FontAwesomeIcon icon={faPlus} />
          &nbsp;Create New Model
        </Button>

        <Search
          className={styles.Search}
          name="filter_schema"
          placeholder="Filter model list"
          onChange={(name, term) => {
            term = term.trim().toLowerCase();
            if (term) {
              setNav(
                props.nav.filter(
                  m =>
                    m.label.toLowerCase().includes(term) ||
                    m.name.includes(term)
                )
              );
            } else {
              setNav(props.nav);
            }
          }}
        />
      </div>

      <div className={styles.ModelList}>
        <Nav
          className={styles.PageSets}
          id="pagesets"
          name="pagesets"
          selected={selected}
          tree={nav}
        />
      </div>
    </nav>
  );
}
