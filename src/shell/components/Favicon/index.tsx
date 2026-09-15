import { useEffect, useReducer, useState } from "react";
import { MemoryRouter } from "react-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, IconButton, Button, Skeleton } from "@mui/material";
import { Close, Save, DoDisturbAlt } from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { Modal, ModalContent, ModalFooter, ModalHeader } from "../legacy/Modal";
import { AppLink } from "shell/components/AppLink";

import { MediaApp } from "../../../apps/media/src/app";
import { notify } from "../../store/notifications";
import styles from "./favicon.less";
import { isImage } from "../../../apps/media/src/app/utils/fileUtils";
import {
  useCreateHeadTagMutation,
  useGetHeadTagsQuery,
  useDeleteHeadTagMutation,
} from "../../services/instance";
import { FieldTypeMedia } from "../../../apps/content-editor/src/app/components/FieldTypeMedia";
import { AppState } from "../../store/types";
import {
  useGetAllBinFilesQuery,
  useGetBinsQuery,
} from "../../services/mediaManager";

const SIZES = [32, 128, 152, 167, 180, 192, 196] as const;

type FaviconData = {
  faviconZUID: string;
  faviconURL: string;
  headtagZUID: string;
};
type FaviconProps = {
  onCloseFaviconModal: () => void;
};
export const Favicon = ({ onCloseFaviconModal }: FaviconProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const ui = useSelector((state: AppState) => state.ui);
  const instance = useSelector((state: AppState) => state.instance);

  const [imageModal, setImageModal] = useState(null);
  const [showSizePreviews, setShowSizePreviews] = useState(false);
  const [faviconData, updateFaviconData] = useReducer(
    (state: FaviconData, update: Partial<FaviconData>) => {
      return {
        ...state,
        ...update,
      };
    },
    {
      faviconZUID: "",
      faviconURL: "",
      headtagZUID: "",
    }
  );

  const { data: headTags, isFetching: isFetchingHeadTags } =
    useGetHeadTagsQuery();
  const [deleteHeadTag] = useDeleteHeadTagMutation();
  const [
    createHeadTag,
    {
      isLoading: isUpdatingFavicon,
      isSuccess: isFaviconUpdated,
      error: faviconUpdateError,
    },
  ] = useCreateHeadTagMutation();
  const { data: bins, isFetching: isFetchingBins } = useGetBinsQuery({
    instanceId: instance?.ID,
    ecoId: instance?.ecoID,
  });
  const { data: allMediaFiles, isFetching: isFetchingAllMediaFiles } =
    useGetAllBinFilesQuery(
      bins?.map((bin) => bin.id),
      { skip: !bins?.length }
    );

  useEffect(() => {
    if (isFaviconUpdated || !!faviconUpdateError) {
      onCloseFaviconModal();
      dispatch(
        notify({
          message: !!faviconUpdateError
            ? t("shell.failedUpdateFavicon")
            : t("shell.faviconUpdated"),
          kind: !!faviconUpdateError ? "warn" : "success",
        })
      );
    }
  }, [isFaviconUpdated, faviconUpdateError]);

  useEffect(() => {
    if (!!headTags?.length && !!allMediaFiles?.length) {
      const tag = Object.values(headTags).find(
        (tag) => tag.attributes?.sizes === "196x196"
      );

      if (!tag) {
        return;
      }

      const faviconZUID = allMediaFiles.find(
        (file) => file.url === tag.attributes?.href
      )?.id;

      if (tag) {
        updateFaviconData({
          headtagZUID: tag.ZUID,
          faviconURL: tag.attributes?.href,
          faviconZUID: faviconZUID,
        });
      }
    }
  }, [headTags, allMediaFiles]);

  const handleImage = (ZUID: string) => {
    if (ZUID) {
      if (ZUID.startsWith("3-")) {
        const faviconMediaItem = allMediaFiles?.find(
          (file) => file.id === ZUID
        );

        if (!!faviconMediaItem) {
          updateFaviconData({
            faviconZUID: ZUID,
            faviconURL: faviconMediaItem?.url,
          });
          setShowSizePreviews(true);
        }
      } else {
        // External URL (e.g. from Bynder)
        updateFaviconData({
          faviconZUID: "",
          faviconURL: ZUID,
        });
      }
    } else {
      updateFaviconData({
        faviconZUID: "",
        faviconURL: "",
      });
    }
  };

  const handleSave = () => {
    if (faviconData?.headtagZUID) {
      deleteHeadTag(faviconData.headtagZUID);
    }

    createHeadTag({
      type: "link",
      resourceZUID: instance.ZUID,
      attributes: {
        rel: "icon",
        type: "image/png",
        sizes: "196x196",
        href: faviconData?.faviconURL,
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

  const images = faviconData?.faviconZUID
    ? [faviconData.faviconZUID]
    : faviconData?.faviconURL
    ? [faviconData.faviconURL]
    : [];
  const isLoading =
    isFetchingHeadTags || isFetchingBins || isFetchingAllMediaFiles;

  return (
    <>
      <Modal
        open={ui.isUpdateFaviconModalOpen}
        className={styles.Modal}
        onClose={() => onCloseFaviconModal()}
      >
        <ModalHeader>
          <h1 className={styles.headline}>
            {t("shell.selectInstanceFavicon")}
          </h1>
        </ModalHeader>
        <ModalContent>
          {isLoading ? (
            <Skeleton height={82} variant="rounded" />
          ) : (
            <>
              <FieldTypeMedia
                limit={1}
                images={images}
                openMediaBrowser={(opts) => {
                  setImageModal({
                    ...opts,
                  });
                }}
                name={"favicon"}
                onChange={handleImage}
                hideDrag
                lockedToGroupId={null}
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
                    onClose={() => setImageModal(null)}
                  >
                    <IconButton
                      sx={{
                        position: "fixed",
                        right: 5,
                        top: 0,
                      }}
                      onClick={() => setImageModal(null)}
                    >
                      <Close sx={{ color: "common.white" }} />
                    </IconButton>
                    <MediaApp
                      limitSelected={1}
                      isSelectDialog={true}
                      showHeaderActions={false}
                      addImagesCallback={(images) => {
                        if (!isImage(images[0])) return;
                        imageModal.callback(images);
                        setImageModal(null);
                      }}
                      isReplace={imageModal.isReplace}
                    />
                  </Dialog>
                </MemoryRouter>
              )}

              {faviconData?.faviconZUID && showSizePreviews && (
                <section className={styles.Sizes}>
                  {SIZES.map((size) => (
                    <figure key={size}>
                      <img
                        src={`${CONFIG.SERVICE_MEDIA_RESOLVER}/resolve/${faviconData?.faviconZUID}/getimage/?w=${size}&h=${size}&type=fit`}
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
                  onCloseFaviconModal();
                }}
              >
                <FontAwesomeIcon icon={faCog} />
                {t("shell.manageInstanceHeadTags")}
              </AppLink>
            </>
          )}
        </ModalContent>
        <ModalFooter className={styles.Actions}>
          <Button
            variant="contained"
            onClick={() => {
              onCloseFaviconModal();
            }}
            startIcon={<DoDisturbAlt />}
          >
            {t("shell.cancelEsc")}
          </Button>
          <Button
            variant="contained"
            color="success"
            data-cy="faviconSave"
            loadingPosition="start"
            onClick={handleSave}
            disabled={isLoading}
            loading={isUpdatingFavicon}
            startIcon={<Save />}
          >
            {t("shell.saveFavicon")}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};
