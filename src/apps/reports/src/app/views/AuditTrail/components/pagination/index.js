import { Component } from "react";
import { connect } from "react-redux";

import Button from "@mui/material/Button";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";

import styles from "./styles.less";

class Pagination extends Component {
  handlePagination(page) {
    console.log("handlePagination", page);
  }
  render() {
    return (
      <nav className={styles.auditPagination}>
        <ButtonGroup className={styles.group}>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 1)}
          >
            1
          </Button>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 2)}
          >
            2
          </Button>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 3)}
          >
            3
          </Button>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 4)}
          >
            4
          </Button>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 5)}
          >
            5
          </Button>
          <Button
            variant="contained"
            className={styles.child}
            onClick={this.handlePagination.bind(this, 6)}
          >
            6
          </Button>
        </ButtonGroup>
      </nav>
    );
  }
}

export default connect((state) => state)(Pagination);
