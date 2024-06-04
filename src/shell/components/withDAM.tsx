import React, {
  ComponentType,
  MutableRefObject,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { MemoryRouter } from "react-router";
import { IconButton } from "@zesty-io/material";
import { GridCloseIcon } from "@mui/x-data-grid-pro";
import { Dialog } from "@mui/material";
import { MediaApp } from "../../apps/media/src/app";
import Cookies from "js-cookie";

export const withDAM = (WrappedComponent: ComponentType) =>
  forwardRef((props: any, ref: MutableRefObject<HTMLIFrameElement>) => {
    const [showZestyDAM, setShowZestyDAM] = useState(false);

    useEffect(() => {
      window.addEventListener("message", handleZestyDAMRequest);
      return () => {
        window.removeEventListener("message", handleZestyDAMRequest);
      };
    }, []);

    const handleZestyDAMRequest = (event: MessageEvent) => {
      if (
        event.data.type === "ZESTY_DAM_REQUEST" &&
        // Ensure the session is valid by checking against the current token
        event.data.token === Cookies.get(CONFIG.COOKIE_NAME)
      ) {
        setShowZestyDAM(true);
      }
    };

    return (
      <>
        <WrappedComponent ref={ref} {...props} />
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
                  ref.current.contentWindow.postMessage(
                    {
                      type: "ZESTY_DAM_RESPONSE",
                      source: "zesty",
                      payload: images,
                    },
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
  });
