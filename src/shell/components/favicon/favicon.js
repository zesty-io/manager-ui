import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faBan,
  faGlobe,
  faUpload,
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

import { request } from "utility/request";

import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@zesty-io/core/Modal";
import { Button } from "@zesty-io/core/Button";
import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { AppLink } from "@zesty-io/core/AppLink";

import { fetchHeadTags, createHeadTag } from "shell/store/headTags";

import styles from "./favicon.less";
export default connect(state => {
  return {
    instance: state.instance,
    headTags: state.headTags
  };
})(function favicon(props) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [faviconZUID, setFaviconZUID] = useState("");
  const [faviconURL, setFaviconURL] = useState("");

  const [sizes] = useState([32, 128, 152, 167, 180, 192, 196]);

  useEffect(() => {
    props.dispatch(fetchHeadTags());
  }, []);

  useEffect(() => {
    const tag = Object.values(props.headTags).find(tag =>
      tag.attributes.find(
        attr => attr.key === "sizes" && attr.value === "196x196"
      )
    );
    if (tag) {
      const attr = tag.attributes.find(attr => attr.key === "href");
      setFaviconURL(attr.value);
    }
  }, [props.headTags]);

  const handleClose = () => setOpen(false);

  const handleImage = zuid => {
    if (!zuid) {
      setFaviconZUID("");
      setFaviconURL("");
    } else {
      setLoading(true);
      request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${zuid}`).then(res => {
        const { url, id } = res.data[0];
        setFaviconURL(url);
        setFaviconZUID(id);
        setLoading(false);
      });
    }
  };

  const handleSave = () => {
    setLoading(true);
    props
      .dispatch(
        createHeadTag({
          type: "link",
          resourceZUID: props.instance.ZUID,
          attributes: {
            rel: "icon",
            type: "image/png",
            sizes: "196x196",
            href: faviconURL
          },
          sort: 0
        })
      )
      .finally(_ => {
        setOpen(false);
        setLoading(false);
      });

    // TODO make various favicon sizes and create head tags
    // const sizes = [32, 128, 152, 167, 180, 192, 196];

    // // Crop image and create head tags for all sizes
    // Promise.all(
    //   sizes.map(size =>
    //     request(
    //       `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${size}&h=${size}&type=fit`
    //     )
    //   )
    // )
    //   .then(responses => {
    //     console.log("resized images", responses);

    //     const tags = responses.map((res, i) => {
    //       return props.dispatch(
    //         createHeadTag({
    //           type: "link",
    //           resourceZUID: props.instance.ZUID,
    //           attributes: {
    //             rel: "icon",
    //             type: "image/png",
    //             sizes: `${sizes[i]}x${sizes[i]}`,
    //             href: res.header.location
    //           },
    //           sort: i
    //         })
    //       );
    //     });

    //     Promise.all(tags).then(_ => {
    //       setFaviconURL(url);
    //       setFaviconZUID(id);
    //       setLoading(false);
    //     });
    //   })
    //   .catch(err => {
    //     setLoading(false);
    //     console.log("failed creating favicons", err);
    //   });

    // if (!zuid) {
    //   setFaviconZUID("");
    //   setFaviconURL("");
    // } else {
    //   setLoading(true);
    //   request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${zuid}`).then(res => {
    //     const { url, id } = res.data[0];

    //   });
    // }
  };

  return (
    <div
      className={styles.Favicon}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.display}>
        {hover ? (
          <FontAwesomeIcon
            title="Select Instance Favicon"
            icon={faUpload}
            onClick={() => setOpen(!open)}
          />
        ) : faviconURL ? (
          <img src={faviconURL} width="60px" height="60px" />
        ) : (
          <FontAwesomeIcon icon={faGlobe} />
        )}
      </div>

      <Modal open={open} className={styles.Modal}>
        <ModalHeader>
          <h1 className={styles.headline}>Select Instance Favicon</h1>
        </ModalHeader>
        <ModalContent>
          <FieldTypeImage
            name="favicon"
            label="Image to be used as instance favicon"
            description="Favicons are used by search engine, browsers and applications. They are typically displayed along side your domain name. We recommend using a square PNG image with a transparent background, 228 x 228 or greater."
            tooltip="Because favicons are used in multiple settings we will create multiple sizes of the image you select to fit each use case."
            // limit={1}
            // values field displays
            images={faviconZUID ? [faviconZUID] : []}
            // feed to media app
            value={faviconZUID}
            onChange={handleImage}
            resolveImage={(zuid, width, height) => {
              return `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`;
            }}
            mediaBrowser={opts => {
              riot.mount(
                document.querySelector("#modalMount"),
                "media-app-modal",
                opts
              );
            }}
          />

          {faviconZUID && (
            <section className={styles.Sizes}>
              {sizes.map(size => (
                <figure key={size}>
                  <img
                    src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${faviconZUID}/getimage/?w=${size}&h=${size}&type=fit`}
                  />
                  <figcaption>{`${size}x${size}`}</figcaption>
                </figure>
              ))}
            </section>
          )}
          <AppLink
            className={styles.SettingsLink}
            to="/settings/head"
            onClick={handleClose}
          >
            <FontAwesomeIcon icon={faCog} />
            Manage Instance Head Tags
          </AppLink>
        </ModalContent>
        <ModalFooter>
          <ButtonGroup className={styles.Actions}>
            <Button kind="save" className={styles.Button} onClick={handleSave}>
              {loading ? (
                <FontAwesomeIcon icon={faSpinner} />
              ) : (
                <FontAwesomeIcon icon={faUpload} />
              )}
              Save Favicon
            </Button>
            <Button kind="cancel" onClick={handleClose}>
              <FontAwesomeIcon icon={faBan} />
              Cancel (ESC)
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
    </div>
  );
});
