import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import styles from "./RedirectImportTable.less";

import RedirectImportTableRow from "./RedirectImportTableRow";
import ImportTableRowDisabled from "./ImportTableRowDisabled";

import { createRedirect } from "../../../store/redirects";
import { cancelImports } from "../../../store/imports";

function RedirectImportTable(props) {
  const handleCancelImport = () => {
    props.dispatch(cancelImports());
  };

  const handleAddAllRedirects = () => {
    Object.keys(props.imports).forEach((path) => {
      const redirect = props.imports[path];
      if (redirect.canImport) {
        props.dispatch(
          createRedirect({
            path: redirect.path,
            query_string: redirect.query_string,
            targetType: redirect.target_type,
            target: redirect.target_zuid || redirect.target,
            code: +redirect.code,
          })
        );
      }
    });
  };
  return (
    <section className={styles.RedirectImportTable}>
      <div className={styles.Actions}>
        <Button className={styles.addAll} onClick={handleAddAllRedirects}>
          <FontAwesomeIcon icon={faPlus} />
          Add All Redirects
        </Button>

        <Button onClick={handleCancelImport}>
          <FontAwesomeIcon icon={faTimes} />
          Close Import
        </Button>
      </div>
      <div className={styles.Header}>
        <span className={cx(styles.Cell, styles.subheadline)}>
          Incoming Path
        </span>
        <span className={cx(styles.Cell, styles.subheadline)}>Http Code</span>
        <span className={cx(styles.Cell, styles.subheadline)}>
          Redirect Type
        </span>
        <span className={cx(styles.Cell, styles.subheadline)}>
          Redirect Target
        </span>
      </div>
      <main className={styles.TableBody}>
        {Object.keys(props.imports).map((key) => {
          if (props.imports[key].canImport) {
            return (
              <RedirectImportTableRow
                key={key}
                paths={props.paths}
                dispatch={props.dispatch}
                siteZuid={props.siteZuid}
                {...props.imports[key]}
              />
            );
          } else {
            return <ImportTableRowDisabled key={key} {...props.imports[key]} />;
          }
        })}
      </main>
    </section>
  );
}

export default RedirectImportTable;
