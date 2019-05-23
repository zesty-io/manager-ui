import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./styles.less";

import { searchInViewLogs, filterInViewLogs } from "../../store/inViewLogs";

class AuditControls extends Component {
  handleFilter(evt) {
    this.props.dispatch(filterInViewLogs(evt.target.dataset.data));
  }
  handleSearch(evt) {
    this.props.dispatch(searchInViewLogs(evt.target.value.trim()));
  }
  render() {
    return (
      <header className={styles.auditControls}>
        <div className={styles.title}>
          <h2>Audit Trail&trade;</h2>
          <p>
            Keep track of your content. Logged {this.props.logCount} actions and
            counting.
          </p>
        </div>
        <Search
          placeholder="Search Logs"
          keyUp={this.handleSearch.bind(this)}
        />
        <ButtonGroup className={styles.btnGroup}>
          <Button
            className={styles.child}
            text="Today"
            onClick={this.handleFilter.bind(this)}
            data="1"
          />
          <Button
            className={styles.child}
            text="Last Week"
            onClick={this.handleFilter.bind(this)}
            data="7"
          />
          <Button
            className={styles.child}
            text="Last Month"
            onClick={this.handleFilter.bind(this)}
            data="30"
          />
        </ButtonGroup>
      </header>
    );
  }
}

export default connect(state => state)(AuditControls);
