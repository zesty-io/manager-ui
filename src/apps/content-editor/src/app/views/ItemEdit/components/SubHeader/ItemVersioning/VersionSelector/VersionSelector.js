import React from "react";
import { connect } from "react-redux";
import moment from "moment-timezone";
import cx from "classnames";

import { Select, Option } from "@zesty-io/core/Select";

import { fetchVersions } from "shell/store/contentVersions";

import styles from "./VersionSelector.less";
export default connect((state, props) => {
  return {
    versions: state.contentVersions[props.itemZUID] || []
  };
})(
  class VersionSelector extends React.Component {
    state = {
      loading: false,
      latestVersion:
        this.props.versions.length && this.props.versions[0].meta.version,
      selectedVersion:
        this.props.versions.length && this.props.versions[0].meta.version
    };

    componentDidMount() {
      this.loadItemVersions();
    }

    static getDerivedStateFromProps(props, state) {
      // new version was introduced so make it latest and selected
      if (
        props.versions.length &&
        props.versions[0].meta.version !== state.latestVersion
      ) {
        return {
          ...state,
          latestVersion: props.versions[0].meta.version,
          selectedVersion: props.versions[0].meta.version
        };
      }
      return null;
    }

    loadItemVersions = () => {
      this.setState({
        loading: true
      });
      this.props
        .dispatch(fetchVersions(this.props.modelZUID, this.props.itemZUID))
        .then(res => {
          this.setState({
            loading: false
          });
        });
    };

    onSelect = (name, versionNumber) => {
      const version = this.props.versions.find(
        version => version.meta.version == versionNumber
      );

      if (version) {
        this.props.dispatch({
          type: "LOAD_ITEM_VERSION",
          itemZUID: this.props.itemZUID,
          data: version
        });

        this.setState({
          selectedVersion: version.meta.version
        });
      }
    };

    render() {
      return (
        <Select
          name="itemVersion"
          className={cx(
            styles.VersionSelector,
            this.state.selectedVersion !== this.state.latestVersion
              ? styles.NotLatest
              : null
          )}
          value={this.state.selectedVersion}
          loading={this.state.loading}
          onSelect={this.onSelect}
        >
          {this.props.versions.map(item => (
            <Option
              key={`${item.meta.ZUID}:${item.meta.version}`}
              className={styles.VersionOption}
              value={item.meta.version}
              html={`Version ${item.meta.version} <small>[${moment(
                item.web.createdAt
              ).format("MMM Do YYYY, [at] h:mm a")}]</small>`}
            />
          ))}
        </Select>
      );
    }
  }
);
