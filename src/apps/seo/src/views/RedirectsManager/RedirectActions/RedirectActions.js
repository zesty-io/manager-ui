import styles from "./RedirectActions.less";

import { RedirectFilter } from "./RedirectFilter";

export default function RedirectActions(props) {
  return (
    <header className={styles.RedirectActions}>
      <h1 className={styles.title}>{props.redirectsTotal} Total Redirects</h1>
      <div className={styles.actions}>
        <RedirectFilter dispatch={props.dispatch} />
      </div>
    </header>
  );
}
