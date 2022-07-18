import { useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";

export const useParams = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const setParams = (val, name) => {
    if (val) {
      params.set(name, val);
    } else {
      params.delete(name);
    }

    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  return [params, setParams];
};
