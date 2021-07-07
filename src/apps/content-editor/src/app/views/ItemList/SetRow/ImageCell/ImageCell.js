import { PureComponent } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

import styles from "./ImageCell.less";
export class ImageCell extends PureComponent {
  render() {
    if (this.props.value) {
      if (this.props.value.slice(0, 4) === "http") {
        return (
          <span className={cx(this.props.className, styles.ImageCell)}>
            <img src={this.props.value} />
          </span>
        );
      } else {
        return (
          <span className={cx(this.props.className, styles.ImageCell)}>
            <img
              src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${this.props.value}/getimage/?h=75&type=fit`}
            />
          </span>
        );
      }
    } else {
      return (
        <span
          className={cx(this.props.className, styles.ImageCell, styles.Empty)}
        >
          <FontAwesomeIcon icon={faImage} />
        </span>
      );
    }
  }
}
