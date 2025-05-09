import { useEffect, useState } from "react";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";
import { fetchRedirects } from "../../store/redirects";
import { Box } from "@mui/material";
import RedirectActions from "./RedirectActions";
import { LoadingQuote } from "../../../../../shell/components/LoadingQuote";

export default function RedirectManager(props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    props
      .dispatch(fetchRedirects())
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        props.dispatch(
          notify({
            kind: "warn",
            message: "Failed to load redirects data",
          })
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
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
        <RedirectActions
          dispatch={props.dispatch}
          redirectsTotal={Object.keys(props.redirects).length}
        />
      </Box>

      <Box
        flexGrow={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        px={4}
        pt={2}
        boxSizing="border-box"
        position="relative"
      >
        {Object.keys(props.imports).length ? (
          <RedirectImportTable {...props} />
        ) : (
          <RedirectsTable {...props} />
        )}
      </Box>
    </>
  );
}
