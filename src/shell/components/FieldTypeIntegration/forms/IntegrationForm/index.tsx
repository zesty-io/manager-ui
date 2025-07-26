import { useRef, useState, memo } from "react";
import { Dialog } from "@mui/material";
import ConnectToApi from "./ConnectToApi";
import SelectDisplayOptions from "./SelectDisplayOptions";
import ConfigureDisplayOptions from "./ConfigureDisplayOptions";
import {
  IntegrationFieldConfig,
  IntegrationRequestHeaders,
} from "../../../../services/types";

const IntegrationForm = ({
  integrationFieldConfig,
  activeStep,
  setActiveStep,
  isFormOpen,
  setIsFormOpen,
  onChange,
}: {
  integrationFieldConfig: IntegrationFieldConfig;
  activeStep: number;
  setActiveStep: (step: number) => void;
  isFormOpen: boolean;
  setIsFormOpen: (isOpen: boolean) => void;
  onChange?: (value: IntegrationFieldConfig) => void;
}) => {
  const containerRef = useRef(null);

  const [endpoint, setEndpoint] = useState(
    integrationFieldConfig?.endpoint || ""
  );
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    integrationFieldConfig?.headers || null
  );
  const [type, setType] = useState(integrationFieldConfig?.type || null);
  const [keyPaths, setKeyPaths] = useState(
    integrationFieldConfig?.keyPaths || null
  );

  const [apiData, setApiData] = useState(null);

  const closeForm = () => {
    setIsFormOpen(false);
  };

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
            maxWidth: "1200px",
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
        <ConnectToApi
          activeStep={activeStep}
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          headers={headers}
          setHeaders={setHeaders}
          setApiData={setApiData}
          setActiveStep={setActiveStep}
          closeForm={closeForm}
        />
      ) : activeStep === 2 ? (
        <SelectDisplayOptions
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          endpoint={endpoint}
          type={type}
          setType={setType}
          closeForm={closeForm}
        />
      ) : activeStep === 3 ? (
        <ConfigureDisplayOptions
          endpoint={endpoint}
          headers={headers}
          type={type}
          keyPaths={keyPaths}
          setKeyPaths={setKeyPaths}
          apiData={apiData}
          onChange={onChange}
          closeForm={closeForm}
          setActiveStep={setActiveStep}
        />
      ) : null}
    </Dialog>
  );
};

export default memo(IntegrationForm);
