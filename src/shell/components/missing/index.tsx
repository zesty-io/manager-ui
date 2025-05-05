import { useSelector } from "react-redux";
import { Products } from "../../services/types";
import { AppState } from "../../store/types";
import InvalidUrl from "../InvalidUrl";
import AccessDenied from "../AccessDenied";

const MANAGER_APPS: (Products | "search")[] = [
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
];

const Missing = () => {
  const { products }: { products: Products[] } = useSelector(
    (state: AppState) => state.products.products
  );
  const appRoute = location.pathname.split("/")[1] as Products;
  const isValidAppRoute: boolean = MANAGER_APPS?.includes(appRoute);
  const noAccess: boolean = !products?.includes(appRoute);

  return isValidAppRoute && noAccess ? <AccessDenied /> : <InvalidUrl />;
};

export default Missing;
