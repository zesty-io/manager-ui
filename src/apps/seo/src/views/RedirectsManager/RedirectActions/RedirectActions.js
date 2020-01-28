import cx from "classnames";
import styles from "./RedirectActions.less";

import RedirectFilter from "./RedirectFilter";
import RedirectsImport from "./RedirectsImport";

import { CSVImporter } from "../../../store/imports";

export default function RedirectActions(props) {
  return (
    <header className={styles.RedirectActions}>
      <h1 className={styles.title}>{props.redirectsTotal} Total Redirects</h1>
      <div className={styles.actions}>
        <RedirectFilter dispatch={props.dispatch} />
        <RedirectsImport
          onChange={evt => {
            props.dispatch(CSVImporter(evt));
          }}
        />
      </div>
    </header>
  );
}
