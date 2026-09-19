import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  MutableRefObject,
} from "react";
import { useTranslation } from "react-i18next";

import { GridApi, useGridApiRef } from "@mui/x-data-grid-pro";
import { useDispatch } from "react-redux";
import { useGetRedirectsQuery } from "../../../../../../shell/services/instance";
import { notify } from "../../../../../../shell/store/notifications";

import { Redirects } from "../../../../../../shell/services/types";
import { LoadingQuote } from "../../../../../../shell/components/LoadingQuote";

export type RedirectsTableContextProps = {
  redirects: Redirects[];
  isLoading: boolean;
  sortBy: string;
  httpCodeFilter: string | null;
  typeFilter: string | null;
  searchFilter: string;
  setSearchFilter: (searchFilter: string) => void;
  setSortBy: (sortBy: string) => void;
  setHttpCodeFilter: (httpCodeFilter: string | null) => void;
  setTypeFilter: (typeFilter: string | null) => void;
  apiRef: MutableRefObject<GridApi>;
  isTableLoaded: boolean;
  setIsTableLoaded: (isTableLoaded: boolean) => void;
};

const RedirectsTableContext = createContext<RedirectsTableContextProps | null>(
  null
);

const RedirectsTableContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [httpCodeFilter, setHttpCodeFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const apiRef = useGridApiRef<GridApi>();
  const [isTableLoaded, setIsTableLoaded] = useState(false);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { data: redirects, isLoading, isError } = useGetRedirectsQuery();

  useEffect(() => {
    if (isError && !isLoading) {
      dispatch(
        notify({
          kind: "warn",
          message: t("seo.redirectsLoadFailed"),
        })
      );
    }
  }, [isError, isLoading]);

  return (
    <RedirectsTableContext.Provider
      value={{
        redirects,
        isLoading,
        sortBy,
        httpCodeFilter,
        typeFilter,
        searchFilter,
        setSearchFilter,
        setSortBy,
        setHttpCodeFilter,
        setTypeFilter,
        apiRef,
        isTableLoaded,
        setIsTableLoaded,
      }}
    >
      {isLoading ? <LoadingQuote /> : children}
    </RedirectsTableContext.Provider>
  );
};

export const useRedirectsTable = () => {
  const context = useContext(RedirectsTableContext);
  if (context === null) {
    throw new Error(
      "useRedirectsTable must be used within a RedirectsTableContextProvider"
    );
  }
  return context;
};

export default RedirectsTableContextProvider;
