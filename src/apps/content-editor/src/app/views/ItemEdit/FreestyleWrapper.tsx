import Cookies from "js-cookie";
import { MutableRefObject, forwardRef, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import { useHistory, useParams } from "react-router";
import { withDAM } from "../../../../../../shell/components/withDAM";
import { Button, Dialog } from "@mui/material";

const IframeComponent = forwardRef(
  (props: any, ref: MutableRefObject<HTMLIFrameElement>) => {
    return <iframe ref={ref} {...props}></iframe>;
  }
);

const IframeWithDAM = withDAM(IframeComponent);

export const FreestyleWrapper = () => {
  const { modelZUID, itemZUID } = useParams<{
    modelZUID: string;
    itemZUID: string;
  }>();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const history = useHistory();

  const instance = useSelector((state: AppState) => state.instance);
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
      `${CONFIG.URL_APPS}/freestyle/`
    );
  };

  const handleFreestyleExit = () => {
    history.push(`/content/${modelZUID}/${itemZUID}`);
  };

  return (
    <Dialog
      open
      fullScreen
      PaperProps={{
        sx: {
          overflow: "hidden",
        },
      }}
    >
      <Button
        onClick={handleFreestyleExit}
        sx={{
          width: "66px",
          height: "32px",
          position: "fixed",
          top: "0px",
          right: "0px",
        }}
      ></Button>
      <IframeWithDAM
        src={`${CONFIG.URL_APPS}/freestyle/`}
        ref={iframeRef}
        allow="clipboard-write"
        height="100%"
        width="100%"
        frameBorder="0"
        onLoad={handleLoad}
      ></IframeWithDAM>
    </Dialog>
  );
};
