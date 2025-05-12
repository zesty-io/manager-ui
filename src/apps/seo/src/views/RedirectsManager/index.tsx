import { useEffect } from "react";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";
import { Box } from "@mui/material";
import RedirectActions from "./RedirectActions";
import { LoadingQuote } from "../../../../../shell/components/LoadingQuote";
import { useDispatch } from "react-redux";
import { notify } from "../../../../../shell/store/notifications";
import { useGetRedirectsQuery } from "../../../../../shell/services/instance";
import RedirectsTableContextProvider from "./RedirectsTable/TableSortFilterProvider";

const RedirectsManager = (props: any) => {
  const dispatch = useDispatch();

  const { data: redirects, isLoading, isError } = useGetRedirectsQuery();

  useEffect(() => {
    if (isError && !isLoading) {
      dispatch(
        notify({
          kind: "warn",
          message: "Failed to load redirects data",
        })
      );
    }
  }, [isError, isLoading]);

  if (isLoading) {
    return <LoadingQuote />;
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        px={4}
        pt={4}
        pb={1.75}
        sx={{
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <RedirectActions redirectsTotal={Object.keys(redirects).length} />
      </Box>

      <Box
        flexGrow={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        px={4}
        boxSizing="border-box"
        position="relative"
        sx={{
          height: `calc(100% - 68px - 40px)`,
        }}
      >
        <RedirectsTableContextProvider>
          {Object.keys(props.imports).length ? (
            <RedirectImportTable {...props} />
          ) : (
            <RedirectsTable
              redirects={redirects}
              isLoading={isLoading}
              redirectsFilter={props?.redirectsFilter || ""}
            />
          )}
        </RedirectsTableContextProvider>
      </Box>
    </>
  );
};

export default RedirectsManager;
