import { useSelector } from "react-redux";
import { Products } from "../../services/types";
import { AppState } from "../../store/types";
import InvalidUrl from "../InvalidUrl";
import AccessDenied from "../AccessDenied";

const MANAGER_APPS = [
  "release",
  "media",
  "search",
  "launchpad",
  "content",
  "blocks",
  "reports",
  "code",
  "leads",
  "schema",
  "redirects",
  "settings",
  "apps",
  "studio",
] as const;

const Missing = () => {
  const products = useSelector((state: AppState) => state.products.products);
  const appRoute = location.pathname.split("/")[1] as Products;
  // @ts-ignore
  const isValidAppRoute: boolean = MANAGER_APPS?.includes(appRoute);
  const noAccess: boolean = !products?.includes(appRoute);
  return isValidAppRoute && noAccess ? <AccessDenied /> : <InvalidUrl />;
};

export default Missing;
