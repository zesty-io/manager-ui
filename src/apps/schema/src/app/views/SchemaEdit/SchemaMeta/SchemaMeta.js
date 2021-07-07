import { Info } from "./Info";
import { Settings } from "./Settings";
import { Delete } from "./Delete";

import styles from "./SchemaMeta.less";
export default function SchemaMeta(props) {
  return (
    <aside className={styles.SchemaMeta}>
      <Info {...props} />
      <Settings {...props} />
      <Delete {...props} />
    </aside>
  );
}
