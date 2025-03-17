import { useEffect, useState } from "react";
import { WithLoader } from "@zesty-io/core/WithLoader";
import RedirectsTable from "./RedirectsTable";
import RedirectImportTable from "./RedirectImportTable";
import { fetchRedirects } from "../../store/redirects";
import { Box } from "@mui/material";
import RedirectActions from "./RedirectActions";

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
        py={2}
        boxSizing="border-box"
        position="relative"
      >
        <WithLoader
          condition={!loading}
          message="Loading Redirects"
          height="100%"
        >
          {Object.keys(props.imports).length ? (
            <RedirectImportTable {...props} />
          ) : (
            <RedirectsTable {...props} />
          )}
        </WithLoader>
      </Box>
    </>
  );
}
