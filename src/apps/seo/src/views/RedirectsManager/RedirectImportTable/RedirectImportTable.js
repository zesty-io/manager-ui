import cx from "classnames";

import Button from "@mui/material/Button";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import RedirectImportTableRow from "./RedirectImportTableRow";
import ImportTableRowDisabled from "./ImportTableRowDisabled";

import { createRedirect } from "../../../store/redirects";
import { cancelImports } from "../../../store/imports";

import styles from "./RedirectImportTable.less";
import { Box } from "@mui/material";

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
            targetType: redirect.targetType,
            target: redirect.target_zuid || redirect.target,
            code: +redirect.code,
          })
        );
      }
    });
  };
  return (
    <>
      <Box
        width="100%"
        display="flex"
        flexDirection="row"
        justifyContent="flex-end"
        alignItems="center"
        gap={2}
        pt={4}
        pb={1.75}
        px={4}
        height="84px"
        bgcolor="background.paper"
        borderBottom="2px solid"
        borderColor="border"
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCancelImport}
          startIcon={<CloseIcon color="action" />}
          size="small"
        >
          Close Import
        </Button>
        <Button
          variant="contained"
          onClick={handleAddAllRedirects}
          startIcon={<AddIcon />}
          color="primary"
          size="small"
        >
          Add All Redirects
        </Button>
      </Box>
      <Box height="calc(100% - 84px)" overflow="hidden">
        <section className={styles.RedirectImportTable}>
          <Box width="100%" px={3}>
            <div className={styles.Header}>
              <span className={cx(styles.Cell, styles.subheadline)}>From</span>
              <span className={cx(styles.Cell, styles.subheadline)}>Code</span>
              <span className={cx(styles.Cell, styles.subheadline)}>Type</span>
              <span className={cx(styles.Cell, styles.subheadline)}>To</span>
            </div>
          </Box>
          <Box width="100%" height="calc(100% - 60px)" overflow="auto" px={4}>
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
                return (
                  <ImportTableRowDisabled key={key} {...props.imports[key]} />
                );
              }
            })}
          </Box>
        </section>
      </Box>
    </>
  );
}

export default RedirectImportTable;
