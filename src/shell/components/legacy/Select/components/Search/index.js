import React, { Component } from "react";
import cx from "classnames";
import omit from "lodash/omit";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { Input } from "../Input";

import styles from "./Search.less";
class Search extends Component {
  state = {
    term: String(),
  };

  componentDidMount() {
    this.setState({
      term: this.props.value,
    });
  }

  onChange = (evt) => {
    this.setState(
      {
        term: evt.target.value,
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(
            this.state.term,
            this.props.name,
            this.props.datatype
          );
        }
      }
    );
  };

  onSubmit = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(
        this.state.term,
        this.props.name,
        this.props.datatype
      );
    }
  };

  onKeyUp = () => {
    if (this.props.onKeyUp) {
      this.props.onKeyUp(this.state.term, this.props.name, this.props.datatype);
    }
  };

  render() {
    return (
      <div className={cx(styles.Search, this.props.className)}>
        <Input
          {...omit(this.props, "innerRef")}
          ref={this.props.innerRef}
          type="search"
          className={styles.Input}
          onChange={this.onChange}
        />
        <FontAwesomeIcon className={styles.RoundedSearchIcon} icon={faSearch} />
      </div>
    );
  }
}
const SearchRef = React.forwardRef((props, ref) => (
  <Search innerRef={ref} {...props} />
));

export { SearchRef as Search };
