import { useEffect, useState } from "react";
import { MemoryRouter } from "react-router";
import { connect } from "react-redux";
import { Dialog, IconButton, Button } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import LoadingButton from "@mui/lab/LoadingButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

import { request } from "utility/request";

import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@zesty-io/core/Modal";

import { FieldTypeImage } from "@zesty-io/core/FieldTypeImage";
import { AppLink } from "@zesty-io/core/AppLink";

import { MediaApp } from "../../../apps/media/src/app";

import { notify } from "shell/store/notifications";

import styles from "./favicon.less";
import { isImage } from "../../../apps/media/src/app/utils/fileUtils";
import {
  useCreateHeadTagMutation,
  useGetHeadTagsQuery,
  useDeleteHeadTagMutation,
} from "../../../shell/services/instance";

export default connect((state) => {
  return {
    instance: state.instance,
    ui: state.ui,
  };
})(function favicon(props) {
  const [loading, setLoading] = useState(false);

  const [faviconZUID, setFaviconZUID] = useState("");
  const [faviconURL, setFaviconURL] = useState("");
  const [imageModal, setImageModal] = useState();
  const [headtagZUID, setHeadTagZUID] = useState();

  const [sizes] = useState([32, 128, 152, 167, 180, 192, 196]);

  const { data: headTags } = useGetHeadTagsQuery();
  const [deleteHeadTag] = useDeleteHeadTagMutation();
  const [
    createHeadTag,
    {
      isLoading: isUpdatingFavicon,
      isSuccess: isFaviconUpdated,
      error: faviconUpdateError,
    },
  ] = useCreateHeadTagMutation();

  useEffect(() => {
    if (isFaviconUpdated || !!faviconUpdateError) {
      props.onCloseFaviconModal();
      props.dispatch(
        notify({
          message: !!faviconUpdateError
            ? faviconUpdateError.data.error
            : "Favicon updated",
          kind: !!faviconUpdateError ? "warn" : "success",
        })
      );
    }
  }, [isFaviconUpdated, faviconUpdateError]);

  useEffect(() => {
    if (headTags?.length) {
      const tag = Object.values(headTags).find(
        (tag) => tag.attributes?.sizes === "196x196"
      );

      if (tag) {
        setHeadTagZUID(tag.ZUID);
        setFaviconURL(tag.attributes?.href);
      }
    }
  }, [headTags]);

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
    if (headtagZUID) {
      deleteHeadTag(headtagZUID);
    }

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
    <>
      <Modal
        open={props.ui.isUpdateFaviconModalOpen}
        className={styles.Modal}
        onClose={() => props.onCloseFaviconModal()}
      >
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
            <MemoryRouter>
              <Dialog
                open
                fullScreen
                sx={{ my: 2.5, mx: 10 }}
                PaperProps={{
                  style: {
                    overflow: "hidden",
                  },
                }}
                onClose={() => setImageModal()}
              >
                <IconButton
                  sx={{
                    position: "fixed",
                    right: 5,
                    top: 0,
                  }}
                  onClick={() => setImageModal()}
                >
                  <CloseIcon sx={{ color: "common.white" }} />
                </IconButton>
                <MediaApp
                  limitSelected={1}
                  isSelectDialog={true}
                  showHeaderActions={false}
                  addImagesCallback={(images) => {
                    if (!isImage(images[0])) return;
                    imageModal.callback(images);
                    setImageModal();
                  }}
                />
              </Dialog>
            </MemoryRouter>
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
            onClick={() => {
              props.onCloseFaviconModal();
            }}
          >
            <FontAwesomeIcon icon={faCog} />
            Manage Instance Head Tags
          </AppLink>
        </ModalContent>
        <ModalFooter className={styles.Actions}>
          <Button
            variant="contained"
            onClick={() => {
              props.onCloseFaviconModal();
            }}
            startIcon={<DoDisturbAltIcon />}
          >
            Cancel (ESC)
          </Button>
          <LoadingButton
            variant="contained"
            color="success"
            data-cy="faviconSave"
            loadingPosition="start"
            onClick={handleSave}
            loading={loading || isUpdatingFavicon}
            startIcon={<SaveIcon />}
          >
            Save Favicon
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </>
  );
});
