import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { TransitionProps } from "@mui/material/transitions";
import { cancelImports } from "../../../store/imports";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../../../../../../shell/store/types";
import {
  Box,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RedirectImportTableRow from "./RedirectImportTableRow";
import ImportTableRowDisabled from "./ImportTableRowDisabled";
import { createRedirect } from "../../../store/redirects";
import { RedirectRequest } from "../../../../../../shell/services/types";
import { useCreateRedirectMutation } from "../../../../../../shell/services/instance";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>
) {
  return <Fade ref={ref} {...props} />;
});

type RedirectImportTableProps = RedirectRequest & {
  query_string?: string;
  target_zuid?: string;
  canImport?: boolean;
};

interface ImportData {
  [key: string]: RedirectImportTableProps;
}

const RedirectImportTableComponent = ({
  imports,
  isOpen,
}: {
  imports: ImportData;
  isOpen: boolean;
}) => {
  const dispatch = useDispatch();

  const [inProgressRedirects, setInProgressRedirects] = React.useState([]);

  const closeImportTable = () => {
    dispatch(cancelImports());
  };

  const handleCancelImport = () => {
    dispatch(cancelImports());
  };

  const handleAddAllRedirects = () => {
    Object.keys(imports).forEach(async (path: string) => {
      const redirect = imports[path];

      if (redirect.canImport) {
        setInProgressRedirects((prev) => [...prev, redirect?.path]);
        await dispatch(
          createRedirect({
            path: redirect.path,
            query_string: redirect.query_string || "",
            targetType: redirect.targetType,
            target: redirect.target_zuid || redirect.target || "",
            code: +redirect.code,
          })
        );
        setInProgressRedirects((prev) =>
          prev?.filter(
            (redirectPaths) => !redirectPaths?.includes(redirect?.path)
          )
        );
      }
    });
  };

  return (
    <Dialog
      fullWidth
      maxWidth={false}
      open={isOpen}
      onClose={closeImportTable}
      container={() => document.getElementById("redirects-main-container")}
      hideBackdrop
      slots={{
        transition: Transition,
      }}
      slotProps={{
        root: {
          sx: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
        },
        paper: {
          elevation: 0,
          square: true,
          sx: {
            m: 0,
            height: "100%",
            width: "100%",
            maxHeight: "100%",
            maxWidth: "100%",
            borderRadius: 0,
          },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 4,
          pt: 4,
          pb: 1.75,
          borderBottom: (theme) => `2px solid ${theme.palette.border}`,
          backgroundColor: "background.paper",
        }}
      >
        <Divider />
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-end"
          alignItems="center"
          columnGap={1}
        >
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={handleCancelImport}
            startIcon={<CloseIcon />}
          >
            Close Import
          </Button>
          <Button
            variant="contained"
            onClick={handleAddAllRedirects}
            size="small"
            startIcon={<AddIcon />}
          >
            Add All Redirects
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          overflow: "hidden",
          bgcolor: "grey.50",
          p: 0,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            px: 4,
            pt: 4,
            pb: 0.15,
          }}
        >
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderColor: "border",
              borderRadius: 2,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <Box
              flexGrow={0}
              sx={{
                width: "100%",
                py: 2,
                bgcolor: "grey.100",
                boxShadow: "0px 0px 3px 0px grey.300",
              }}
            >
              <Grid
                container
                spacing={3}
                width="100%"
                pl={2}
                pr={1}
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "nowrap",
                }}
              >
                <Grid size="grow" minWidth="200px">
                  <Typography variant="body1" fontWeight={600}>
                    From
                  </Typography>
                </Grid>

                <Grid minWidth="115px">
                  <Typography variant="body1" fontWeight={600}>
                    Code
                  </Typography>
                </Grid>

                <Grid minWidth="130px">
                  <Typography variant="body1" fontWeight={600}>
                    Type
                  </Typography>
                </Grid>

                <Grid size="grow" minWidth="200px">
                  <Typography variant="body1" fontWeight={600}>
                    To
                  </Typography>
                </Grid>
                <Grid width="115px"></Grid>
              </Grid>
            </Box>
            <Box flexGrow={1} overflow="auto">
              {Object.keys(imports).map((key, index) => {
                const importItem = imports[key];
                if (importItem.canImport) {
                  return (
                    <RedirectImportTableRow
                      key={key}
                      dispatch={dispatch}
                      isLoading={inProgressRedirects?.includes(key)}
                      index={index}
                      {...importItem}
                    />
                  );
                } else {
                  return <ImportTableRowDisabled key={key} {...importItem} />;
                }
              })}
            </Box>
          </Paper>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const RedirectImportTable = () => {
  const importData = useSelector((state: AppState) => state.imports);
  const isOpen = !!Object.keys(importData)?.length;

  return (
    isOpen && (
      <RedirectImportTableComponent imports={importData} isOpen={isOpen} />
    )
  );
};

export default RedirectImportTable;
