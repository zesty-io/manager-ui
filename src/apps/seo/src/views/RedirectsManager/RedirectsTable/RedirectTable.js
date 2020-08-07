import React from "react";
import styles from "./RedirectTable.less";

import { removeRedirect } from "../../../store/redirects";

import RedirectCreator from "./RedirectCreator";
import RedirectsTableHeader from "./RedirectsTableHeader";
import RedirectsTableRow from "./RedirectsTableRow";

export default class RedirectTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirects: this.props.redirects,
      redirectsOrder: Object.keys(this.props.redirects),
      sortBy: "",
      sortDirection: ""
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.redirects != this.state.redirects) {
      this.setState({
        redirects: nextProps.redirects,
        redirectsOrder: this.sort(
          nextProps.redirects,
          this.state.sortBy,
          this.state.sortDirection
        )
      });
    }
  }
  render() {
    return (
      <section className={styles.RedirectsTable}>
        <RedirectsTableHeader
          sortBy={this.state.sortBy}
          sortDirection={this.state.sortDirection}
          handleSortBy={this.handleSortBy.bind(this)}
        />

        <main className={styles.TableBody}>
          <RedirectCreator
            options={this.props.paths}
            siteZuid={this.props.siteZuid}
            dispatch={this.props.dispatch}
          />
          {this.renderRows()}
        </main>
      </section>
    );
  }
  renderRows() {
    const filter = this.props.redirectsFilter;
    var order = [...this.state.redirectsOrder];

    if (filter) {
      order = order.filter(key => {
        const redirect = this.props.redirects[key];
        console.log(redirect);
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
      return order.map(key => {
        const redirect = this.props.redirects[key];
        const callback = this.handleRemoveRedirect.bind(this, redirect.zuid);

        return (
          <RedirectsTableRow
            key={key}
            removeRedirect={callback}
            {...redirect}
          />
        );
      });
    } else {
      return <div className={styles.noResults}>No Results Found</div>;
    }
  }
  handleRemoveRedirect(zuid) {
    this.props.dispatch(removeRedirect(zuid));
  }
  handleSortBy(el) {
    const by = el.currentTarget.dataset.value;
    const direction = this.state.sortDirection === "desc" ? "asc" : "desc";

    this.setState({
      sortBy: by,
      sortDirection: direction,
      redirectsOrder: this.sort(this.state.redirects, by, direction)
    });
  }
  sort(redirects, by, direction) {
    const mapping = {
      type: "code",
      from: "path",
      to: "path"
    };

    if (direction === "desc") {
      return Object.keys(redirects).sort((a, b) => {
        const prev = redirects[a][mapping[by]].toLowerCase().trim();
        const next = redirects[b][mapping[by]].toLowerCase().trim();

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
        const prev = redirects[a][mapping[by]].toLowerCase().trim();
        const next = redirects[b][mapping[by]].toLowerCase().trim();

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
  }
}
