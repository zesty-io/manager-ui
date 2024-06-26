import { useCallback, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
/* 
  This hook serves to easily retrieve and add url parameters to the url.
  params: provides the current URLSearchParams object
  setParams: takes in a val and name parameter to set a new parameter (passing null as a value will remove the parameter)
*/
type UseParams = [URLSearchParams, (val: string | null, name: string) => void];
export const useParams: () => UseParams = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const setParams = useCallback(
    (val: string | null, name: string) => {
      if (val) {
        params.set(name, val);
      } else {
        params.delete(name);
      }

      history.replace({
        pathname: location.pathname,
        search: params.toString(),
      });
    },
    [history, location.pathname, params]
  );

  return [params, setParams];
};
