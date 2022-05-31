import cx from "classnames";

import Button from "@mui/material/Button";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import { Notice } from "@zesty-io/core/Notice";

import RedirectImportTableRow from "./RedirectImportTableRow";
import ImportTableRowDisabled from "./ImportTableRowDisabled";

import { createRedirect } from "../../../store/redirects";
import { cancelImports } from "../../../store/imports";

import styles from "./RedirectImportTable.less";

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
        <Notice>
          Import CSV does not allow for external and wildcard redirects
        </Notice>
        <div className={styles.RedirectButtons}>
          <Button
            variant="contained"
            onClick={handleAddAllRedirects}
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
          >
            Add All Redirects
          </Button>

          <Button
            variant="contained"
            onClick={handleCancelImport}
            startIcon={<CloseIcon />}
          >
            Close Import
          </Button>
        </div>
      </div>
      <div className={styles.Header}>
        <span className={cx(styles.Cell, styles.subheadline)}>From</span>

        <span className={cx(styles.Cell, styles.subheadline)}>Type</span>
        <span className={cx(styles.Cell, styles.subheadline)}>To</span>
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
