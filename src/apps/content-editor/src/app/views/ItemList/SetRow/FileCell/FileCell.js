import React, { Component } from "react";
import cx from "classnames";

import { request } from "utility/request";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { Loader } from "@zesty-io/core/Loader";

import styles from "./FileCell.less";
export class FileCell extends Component {
  state = {
    filename: null,
    filetype: "file-o",
    loading: false
  };
  componentDidMount() {
    this.setState({
      loading: true
    });
    request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${this.props.data}`)
      .then(res => {
        this.setState({ loading: false });
        if (res.status === 400) {
          notify({
            message: `Failure fetching filename: ${res.error}`,
            kind: "error"
          });
        } else {
          const filename = res.data[0].filename;
          this.setState({
            filetype: this.resolveFileType(filename.split(".")[1]),
            filename
          });
        }
      })
      .catch(err => {
        console.error("FileCell:componentDidMount", err);
        this.setState({
          loading: false
        });
      });
  }
  resolveFileType = filesuffix => {
    switch (filesuffix.toLowerCase()) {
      case "jpg":
      case "png":
      case "gif":
      case "jpeg":
        return "file-image-o";
      case "js":
      case "json":
      case "css":
      case "html":
      case "htm":
        return "file-code-o";
      case "pdf":
        return "file-pdf-o";
      case "doc":
        return "file-word-o";
      case "txt":
        return "file-text-o";
      case "xls":
        return "file-excel-o";
      case "wav":
      case "mp3":
      case "ogg":
        return "file-audio-o";
      case "mp4":
      case "mov":
      case "mkv":
        return "film";
      case "zip":
      case "tar":
      case "gz":
        return "file-archive-o";

      default:
        return "file-o";
    }
  };
  render() {
    if (!this.state.loading && !this.state.filename) {
      return (
        <span
          className={cx(this.props.className, styles.FileCell, styles.Empty)}
        >
          <FontAwesomeIcon icon={faFile} />
        </span>
      );
    } else {
      return (
        <span className={cx(this.props.className, styles.FileCell)}>
          {this.state.loading && <Loader />}
          {this.state.filename}
        </span>
      );
    }
  }
}
