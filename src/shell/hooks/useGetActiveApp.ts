import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * This hook is used to find out which app the user is currently using
 */
interface UseGetActiveApp {
  mainApp: string;
  subApp: string;
}
export const useGetActiveApp: () => UseGetActiveApp = () => {
  const { pathname } = useLocation();

  const activeApp: UseGetActiveApp = useMemo(() => {
    return {
      mainApp: pathname.split("/")[1],
      subApp: pathname.split("/")[2] ?? "",
    };
  }, [pathname]);

  return activeApp;
};
