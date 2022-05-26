import { useEffect, useState } from "react";
import { connect } from "react-redux";

import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import CircularProgress from "@mui/material/CircularProgress";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faBan,
  faGlobe,
  faSpinner,
  faFileImage,
} from "@fortawesome/free-solid-svg-icons";

import { request } from "utility/request";

import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@zesty-io/core/Modal";

import { ButtonGroup } from "@zesty-io/core/ButtonGroup";
import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { AppLink } from "@zesty-io/core/AppLink";

import MediaApp from "../../../apps/media/src/app/MediaApp";

import {
  fetchHeadTags,
  createHeadTag,
  deleteHeadTag,
} from "shell/store/headTags";
import { notify } from "shell/store/notifications";

import styles from "./favicon.less";
import MediaStyles from "../../../apps/media/src/app/MediaAppModal.less";

export default connect((state) => {
  return {
    instance: state.instance,
    headTags: state.headTags,
  };
})(function favicon(props) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [faviconZUID, setFaviconZUID] = useState("");
  const [faviconURL, setFaviconURL] = useState("");
  const [imageModal, setImageModal] = useState();
  const [headtagZUID, setHeadTagZUID] = useState();

  const [sizes] = useState([32, 128, 152, 167, 180, 192, 196]);

  useEffect(() => {
    props.dispatch(fetchHeadTags());
  }, []);

  useEffect(() => {
    const tag = Object.values(props.headTags).find((tag) =>
      tag.attributes.find(
        (attr) => attr.key === "sizes" && attr.value === "196x196"
      )
    );
    if (tag) {
      setHeadTagZUID(tag.ZUID);
    }
    if (tag) {
      const attr = tag.attributes.find((attr) => attr.key === "href");
      setFaviconURL(attr.value);
    }
  }, [props.headTags]);

  const onDelete = () => {
    props.dispatch(deleteHeadTag(headtagZUID)).then((res) => {
      props.dispatch(
        notify({
          message: res.data.error ? res.data.error : "Favicon updated",
          kind: res.data.error ? "warn" : "success",
        })
      );
    });
  };

  const handleClose = () => setOpen(false);

  const handleImage = (zuid) => {
    if (!zuid) {
      setFaviconZUID("");
      setFaviconURL("");
    } else {
      setLoading(true);
      request(`${CONFIG.SERVICE_MEDIA_MANAGER}/file/${zuid}`).then((res) => {
        const { url, id } = res.data[0];
        setFaviconURL(url);
        setFaviconZUID(id);
        setLoading(false);
      });
    }
  };

  const handleSave = () => {
    setLoading(true);
    if (headtagZUID) {
      onDelete();
    }
    props
      .dispatch(
        createHeadTag({
          type: "link",
          resourceZUID: props.instance.ZUID,
          attributes: {
            rel: "icon",
            type: "image/png",
            sizes: "196x196",
            href: faviconURL,
          },
          sort: 0,
        })
      )
      .finally((_) => {
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

  const images = faviconZUID ? [faviconZUID] : faviconURL ? [faviconURL] : [];

  return (
    <div
      data-cy="Favicon"
      className={styles.Favicon}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.display}>
        {hover ? (
          <FontAwesomeIcon
            title="Select Instance Favicon"
            icon={faFileImage}
            onClick={() => setOpen(!open)}
          />
        ) : faviconURL ? (
          <img
            src={faviconURL}
            width="60px"
            height="60px"
            alt=" Select Favicon"
          />
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
            data-cy="FieldTypeImage"
            name="favicon"
            label="Image to be used as instance favicon"
            description="Favicons are used by search engine, browsers and applications. They are typically displayed along side your domain name. We recommend using a square PNG image with a transparent background, 228 x 228 or greater."
            tooltip="Because favicons are used in multiple settings we will create multiple sizes of the image you select to fit each use case."
            // limit={1}
            // values field displays
            images={images}
            imageZUID={headtagZUID}
            // feed to media app
            value={faviconZUID}
            onChange={handleImage}
            resolveImage={(zuid, width, height) =>
              `${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${zuid}/getimage/?w=${width}&h=${height}&type=fit`
            }
            mediaBrowser={(opts) => {
              setImageModal(opts);
            }}
          />
          {imageModal && (
            <Modal
              open={true}
              type="global"
              onClose={() => setImageModal()}
              className={MediaStyles.MediaAppModal}
            >
              <MediaApp
                limitSelected={1}
                modal={true}
                addImages={(images) => {
                  imageModal.callback(images);
                  setImageModal();
                }}
              />
            </Modal>
          )}

          {faviconZUID && (
            <section className={styles.Sizes}>
              {sizes.map((size) => (
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
        <ModalFooter className={styles.Actions}>
          <Button
            variant="contained"
            onClick={handleClose}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel (ESC)
          </Button>
          <Button
            variant="contained"
            color="success"
            data-cy="faviconSave"
            onClick={handleSave}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <SaveIcon />
            }
          >
            Save Favicon
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});
