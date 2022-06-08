import { useEffect, useState } from "react";

import { WithLoader } from "@zesty-io/core/WithLoader";

import RedirectActions from "./RedirectActions";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";

import { fetchRedirects } from "../../store/redirects";

import styles from "./RedirectsManager.less";
export default function RedirectManager(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .dispatch(fetchRedirects())
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        props.dispatch(
          notify({
            kind: "warn",
            message: "Failed to load redirects data",
          })
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.RedirectsManager}>
      <RedirectActions
        dispatch={props.dispatch}
        redirectsTotal={Object.keys(props.redirects).length}
      />

      <WithLoader
        condition={!loading}
        message="Loading Redirects"
        height="calc(100vh - 172px)"
      >
        {Object.keys(props.imports).length ? (
          <RedirectImportTable {...props} />
        ) : (
          <RedirectsTable {...props} />
        )}
      </WithLoader>
    </div>
  );
}
