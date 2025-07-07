import { ReactNode, useRef } from "react";
import { Dialog, Paper } from "@mui/material";
import ConnectToApi from "./ConnectToApi";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import SelectDisplayOptions from "./SelectDisplayOptions";
import ConfigureDisplayOptions from "./ConfigureDisplayOptions";

const IntegrationForm = () => {
  const containerRef = useRef(null);
  const {
    activeStep,
    setActiveStep,
    isFormOpen,
    closeForm,
    integrationEndpoint,
  } = useIntegrationField();
  return (
    <Dialog
      data-cy="integrationFormDialog"
      open={isFormOpen}
      onClose={closeForm}
      fullWidth
      sx={{
        "& *": {
          boxSizing: "border-box",
        },
      }}
      slotProps={{
        root: {
          className: "IntegrationConfigForm",
          disablePortal: true,
          keepMounted: false,
        },

        paper: {
          ref: containerRef,
          elevation: 0,

          sx: {
            width: "fit-content",
            maxWidth: "1080px",
            height: "calc(100vh - 40px)",
            minHeight: "860px",
            maxHeight: "1240px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            overflow: "hidden",
            visibility: "visible",
          },
        },
      }}
    >
      {activeStep === 1 ? (
        <ConnectToApi />
      ) : activeStep === 2 ? (
        <SelectDisplayOptions />
      ) : activeStep === 3 ? (
        <ConfigureDisplayOptions />
      ) : null}
    </Dialog>
  );
};

export const FormWrapper = ({
  width,
  height,
  children,
}: {
  width: string | number;
  height: string | number;
  children: ReactNode;
}) => {
  return (
    <Paper
      sx={{
        width: width,
        height: height,
        borderRadius: 2,
        position: "relative",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "stretch",
      }}
    >
      {children}
    </Paper>
  );
};

export default IntegrationForm;
