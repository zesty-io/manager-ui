import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Nav } from "@zesty-io/core/Nav";
import { Search } from "@zesty-io/core/Search";
import { Button } from "@zesty-io/core/Button";

import styles from "./SchemaNav.less";
export default function SchemaNav(props) {
  const history = useHistory();
  const location = useLocation();

  const [nav, setNav] = useState(props.nav);
  const [selected, setSelected] = useState(location.pathname);

  useEffect(() => {
    setNav(props.nav);
  }, [props.nav]);

  useEffect(() => {
    setSelected(location.pathname);
  }, [location.pathname]);

  return (
    <nav className={cx("SchemaNav", styles.SchemaNav)}>
      <div className={styles.Actions}>
        <Button
          className={styles.CreateModel}
          kind="secondary"
          onClick={() => history.push("/schema/new")}
          type="save"
        >
          <FontAwesomeIcon icon={faPlus} />
          &nbsp;Create Model
        </Button>

        <Search
          className={styles.Search}
          name="filter_schema"
          placeholder="Filter model list"
          onChange={(term) => {
            term = term.trim().toLowerCase();
            if (term) {
              setNav(
                props.nav.filter(
                  (m) =>
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
        <h1 className={styles.NavTitle}>Content Model List</h1>
        <Nav
          className={styles.PageSets}
          id="pagesets"
          lightMode="true"
          name="pagesets"
          selected={selected}
          tree={nav}
        />
      </div>
    </nav>
  );
}
