import Cookies from "js-cookie";
import { useEffect, useState } from "react";

type Service = "github" | "google" | "azure" | string;

const tabs = <any>[];
export const useSSO = () => {
  const [token, setToken] = useState("");
  const receiveMessage = (event: MessageEvent<any>) => {
    if (
      // @ts-ignore
      event.origin === CONFIG.SERVICE_AUTH &&
      event.data.source === "zesty" &&
      event.data.status === 200
    ) {
      // @ts-ignore
      const token = Cookies.get(CONFIG.COOKIE_NAME);
      setToken(token);
    }
  };

  const closeOpenedTabs = () => {
    tabs.forEach((tab: any) => {
      tab.close();
    });
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  useEffect(() => {
    if (token) {
      closeOpenedTabs();
    }
  }, [token]);

  const initiate = (service: Service) => {
    let tab = window.open(
      // @ts-ignore
      `${CONFIG.SERVICE_AUTH}/${service}/login`
    );
    tabs.push(tab);
  };

  return [initiate];
};
