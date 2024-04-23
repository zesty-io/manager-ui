import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { MemoryRouter, useParams } from "react-router";
import { IconButton } from "@zesty-io/material";
import { GridCloseIcon } from "@mui/x-data-grid-pro";
import { Dialog } from "@mui/material";
import { MediaApp } from "../../../../../media/src/app";

export const FreestyleWrapper = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const instance = useSelector((state: AppState) => state.instance);
  // @ts-expect-error CONFIG not typed
  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));

  const [showZestyDAM, setShowZestyDAM] = useState(false);

  const handleZestyDAMRequest = (event: MessageEvent) => {
    if (event.data.type === "ZESTY_DAM_REQUEST") {
      setShowZestyDAM(true);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleZestyDAMRequest);
    return () => {
      window.removeEventListener("message", handleZestyDAMRequest);
    };
  }, []);

  const handleLoad = () => {
    // Send users session into frame on load
    iframeRef.current?.contentWindow.postMessage(
      {
        source: "zesty",
        sessionToken,
        instance,
        payload: {
          modelZUID,
          itemZUID,
        },
      },
      // @ts-expect-error CONFIG not typed
      `${CONFIG.URL_APPS}/freestyle/`
    );
  };

  return (
    <>
      <iframe
        // @ts-expect-error CONFIG not typed
        src={`${CONFIG.URL_APPS}/freestyle/`}
        ref={iframeRef}
        allow="clipboard-write"
        height="100%"
        width="100%"
        onLoad={handleLoad}
      ></iframe>
      {showZestyDAM && (
        <MemoryRouter>
          <Dialog
            open
            fullScreen
            sx={{ my: 2.5, mx: 10 }}
            PaperProps={{
              style: {
                borderRadius: "4px",
                overflow: "hidden",
              },
            }}
            onClose={() => setShowZestyDAM(false)}
          >
            <IconButton
              sx={{
                position: "fixed",
                right: 5,
                top: 0,
              }}
              onClick={() => setShowZestyDAM(false)}
            >
              <GridCloseIcon sx={{ color: "common.white" }} />
            </IconButton>
            <MediaApp
              limitSelected={1}
              isSelectDialog={true}
              showHeaderActions={false}
              addImagesCallback={(images) => {
                iframeRef.current.contentWindow.postMessage(
                  {
                    type: "ZESTY_DAM_RESPONSE",
                    source: "zesty",
                    payload: images,
                  },
                  // @ts-expect-error CONFIG not typed
                  `${CONFIG.URL_APPS}/freestyle/`
                );
                setShowZestyDAM(false);
              }}
            />
          </Dialog>
        </MemoryRouter>
      )}
    </>
  );
};
