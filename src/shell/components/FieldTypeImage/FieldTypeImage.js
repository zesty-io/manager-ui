import React, { Fragment } from "react";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@zesty-io/core/Button";

import styles from "./FieldTypeImage.less";
export class FieldTypeImage extends React.PureComponent {
  static defaultProps = {
    images: [], // Array of image ZUIDs
    limit: 1,
    label: "",
  };

  addImage = (images) => {
    const imageZUIDs = images.map((image) => image.id);

    if (this.props.onChange) {
      this.props.onChange(
        [...this.props.images, ...imageZUIDs].join(","),
        this.props.name,
        this.props.datatype
      );
    } else {
      throw new Error("missing remove image action");
    }
  };

  removeImage = (ZUID) => {
    if (this.props.onChange) {
      this.props.onChange(
        this.props.images.filter((image) => image !== ZUID).join(","),
        this.props.name,
        this.props.datatype
      );
    } else {
      throw new Error("missing remove image action");
    }
  };

  render() {
    const maxImages = this.props.limit || 1;
    const imageCount = this.props.images.length;

    return (
      <Fragment>
        {imageCount > maxImages && (
          <p className={styles.WarningMsg}>
            This field is limited to {maxImages}{" "}
            {maxImages > 1 ? "images" : "image"}
          </p>
        )}

        <div
          className={`${styles.FieldTypeImage} ${
            imageCount > maxImages ? styles.warn : ""
          }`}
        >
          <div className={styles.FieldTypeImageContent}>
            {/*
              <h3>Drop images here to upload them to your media</h3>
              <input type="file" className={styles.DropZone} />
            */}
            {this.props.images.map((ZUID, i) => {
              return (
                <Image
                  key={i}
                  imageZUID={ZUID}
                  width="200"
                  height="200"
                  removeImage={this.removeImage}
                  resolveImage={this.props.resolveImage}
                />
              );
            })}

            {new Array(Math.max(0, maxImages - imageCount))
              .fill(0)
              .map((el, i) => (
                <ImageSkeleton
                  key={i}
                  {...this.props}
                  addImage={this.addImage}
                />
              ))}
          </div>
        </div>
      </Fragment>
    );
  }
}

function Image(props) {
  return (
    <figure className={styles.File}>
      {props.imageZUID.substr(0, 4) === "http" ? (
        <img className={styles.image} src={props.imageZUID} />
      ) : (
        <img
          className={styles.image}
          src={props.resolveImage(props.imageZUID, props.width, props.height)}
        />
      )}

      <Button
        className={styles.remove}
        onClick={() => props.removeImage(props.imageZUID)}
      >
        <FontAwesomeIcon icon={faTimes} className={styles.icon} />
      </Button>
    </figure>
  );
}

function ImageSkeleton(props) {
  return (
    <figure className={cx(styles.File, styles.FileSkeleton)}>
      <Button
        onClick={() =>
          props.mediaBrowser({
            callback: props.addImage,
            ids: props.value,
            name: props.name,
            displayName: props.label,
            limit: props.limit,
            lock: props.locked,
          })
        }
      >
        <FontAwesomeIcon icon={faPlus} className={styles.icon} />
      </Button>
    </figure>
  );
}
