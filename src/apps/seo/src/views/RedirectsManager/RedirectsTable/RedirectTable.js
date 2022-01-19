import { useEffect, useState, useRef } from "react";
import styles from "./RedirectTable.less";
import cx from "classnames";

import { removeRedirect } from "../../../store/redirects";

import { RedirectCreator } from "./RedirectCreator";
import RedirectsTableHeader from "./RedirectsTableHeader";
import RedirectsTableRow from "./RedirectsTableRow";

export default function RedirectTable(props) {
  const [redirects, setRedirects] = useState(props.redirects);
  const [redirectsOrder, setRedirectsOrder] = useState(
    Object.keys(props.redirects)
  );
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("");

  useEffect(
    (nextProps) => {
      if (nextProps != redirects) {
        setRedirects(nextProps.redirects);
        setRedirectsOrder(sort(nextProps.redirects));
        setSortBy(sort(sortBy));
        setSortDirection(sort(sortDirection));
      }
    },
    [redirects, redirectsOrder, sortBy, sortDirection]
  );

  // const usePrevious = (value) => {
  //   const ref = useRef();
  //   useEffect(() => {
  //     ref.current = value;
  //   });
  //   return ref.current;
  // };

  // const prevRedirect = usePrevious(redirects);

  // useEffect(() => {
  //   if (prevRedirect !== redirects) {
  //     setRedirects(prevRedirect);
  //     setRedirectsOrder(sort(prevRedirect));
  //     setSortBy(sort(sortBy));
  //     setSortDirection(sort(sortDirection));
  //   }
  // }, [redirects, redirectsOrder, sortBy, sortDirection]);

  // https://stackoverflow.com/a/53446665/6178393

  const handleRemoveRedirect = (zuid) => {
    props.dispatch(removeRedirect(zuid));
  };

  const renderRows = () => {
    const filter = props.redirectsFilter;
    var order = [...redirectsOrder];

    if (filter) {
      order = order.filter((key) => {
        const redirect = props.redirects[key];
        if (
          redirect.path.indexOf(filter) !== -1 ||
          String(redirect.code).indexOf(filter) !== -1 ||
          redirect.ZUID.indexOf(filter) !== -1 ||
          redirect.target.indexOf(filter) !== -1
        ) {
          return true;
        } else {
          return false;
        }
      });
    }

    if (order.length) {
      return order.map((key) => {
        const redirect = props.redirects[key];
        const callback = handleRemoveRedirect(redirect.ZUID);

        return (
          <RedirectsTableRow
            key={key}
            removeRedirect={callback}
            {...redirect}
          />
        );
      });
    } else {
      return (
        <div className={cx(styles.noResults, styles.subheadline)}>
          No Redirect Found
        </div>
      );
    }
  };

  const handleSortBy = (el) => {
    const by = el.currentTarget.dataset.value;
    const direction = sortDirection === "desc" ? "asc" : "desc";

    setSortBy(by);
    setSortDirection(direction);
    setRedirectsOrder(sort(redirects, by, direction));
  };
  const sort = (redirects, by, direction) => {
    const mapping = {
      type: "code",
      from: "path",
      to: "path",
    };

    if (direction === "desc") {
      return Object.keys(redirects).sort((a, b) => {
        const prev = String(redirects[a][mapping[by]])?.toLowerCase().trim();
        const next = String(redirects[b][mapping[by]])?.toLowerCase().trim();

        if (prev > next) {
          return -1;
        }
        if (prev < next) {
          return 1;
        }
        return 0;
      });
    } else if (direction === "asc") {
      return Object.keys(redirects).sort((a, b) => {
        const prev = String(redirects[a][mapping[by]])?.toLowerCase().trim();
        const next = String(redirects[b][mapping[by]])?.toLowerCase().trim();

        if (prev < next) {
          return -1;
        }
        if (prev > next) {
          return 1;
        }
        return 0;
      });
    } else {
      return Object.keys(redirects);
    }
  };

  return (
    <section className={styles.RedirectsTable}>
      <RedirectsTableHeader
        sortBy={sortBy}
        sortDirection={sortDirection}
        handleSortBy={handleSortBy}
      />

      <main className={styles.TableBody}>
        <RedirectCreator
          options={props.paths}
          siteZuid={props.siteZuid}
          dispatch={props.dispatch}
        />
        {renderRows()}
      </main>
    </section>
  );
}
