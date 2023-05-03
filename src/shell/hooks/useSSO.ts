import { useEffect, useState } from "react";

type Service = "github" | "google" | "azure";

interface Message {
  source: "zesty";
  status: string;
  error_message: string;
}

let tabWindow: Window;
export const useSSO = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const receiveMessage = (event: MessageEvent<Message>) => {
    if (
      // @ts-ignore
      event.origin === CONFIG.SERVICE_AUTH &&
      event.data.source === "zesty"
    ) {
      if (event.data.status === "200") {
        setIsAuthenticated(true);
      } else {
        setError(event.data.error_message);
      }
      tabWindow.close();
    }
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  const initiate = (service: Service) => {
    tabWindow?.close();
    tabWindow = window.open(
      // @ts-ignore
      `${CONFIG.SERVICE_AUTH}/${service}/login`
    );
  };

  return [initiate, isAuthenticated, error];
};
