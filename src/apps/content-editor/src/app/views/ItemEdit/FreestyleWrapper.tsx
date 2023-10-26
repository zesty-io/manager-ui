import Cookies from "js-cookie";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useParams } from "react-router";

export const FreestyleWrapper = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const instance = useSelector((state: AppState) => state.instance);
  // @ts-expect-error CONFIG not typed
  const [sessionToken] = useState(Cookies.get(CONFIG.COOKIE_NAME));

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
    <iframe
      // @ts-expect-error CONFIG not typed
      src={`${CONFIG.URL_APPS}/freestyle/`}
      ref={iframeRef}
      allow="clipboard-write"
      height="100%"
      width="100%"
      onLoad={handleLoad}
    ></iframe>
  );
};
