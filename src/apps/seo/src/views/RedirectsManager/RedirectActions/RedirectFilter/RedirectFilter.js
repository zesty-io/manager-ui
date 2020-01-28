import React, { Component } from "react";

import { Search } from "@zesty-io/core/Search";

import styles from "./RedirectFilter.less";
export default class RedirectFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterTimeout: null
    };

    this.redirectFilter = this.redirectFilter.bind(this, "SearchInput");
  }
  render() {
    return (
      <Search
        className={styles.filter}
        onKeyUp={this.redirectFilter}
        placeholder="Filter your redirects by url"
        ref="SearchInput"
      />
    );
  }
  redirectFilter(refName, e) {
    const filterValue = e.target.value.toLowerCase().trim();

    if (this.state.filterTimeout) {
      clearTimeout(this.state.filterTimeout);
    }

    this.setState({
      filterTimeout: setTimeout(() => {
        this.props.dispatch({
          type: "REDIRECT_FILTER",
          filter: filterValue
        });
      }, 100)
    });
  }
}
