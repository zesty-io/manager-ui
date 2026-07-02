import { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  InputBase,
  Dialog,
} from "@mui/material";
import { LinkRounded, Autorenew } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import useIntegrationField from "../useIntegrationField";
import {
  IntegrationFieldConfig,
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
  IntegrationTypes,
} from "../../../services/types";
import SelectDisplayOptions from "./SelectDisplayOptions";
import ConnectToApi from "./ConnectToApi";
import ConfigureDisplayOptions from "./ConfigureDisplayOptions";

type IntegrationFieldConfigProps = {
  integrationFieldConfig: IntegrationFieldConfig;
  onChange: (value: any) => void;
  isLoading?: boolean;
  error?: string | [string, string][] | null;
  isUpdate?: boolean;
};

const IntegrationFieldConfigure = ({
  onChange,
  integrationFieldConfig,
  isLoading = false,
  error = null,
  isUpdate = false,
}: IntegrationFieldConfigProps) => {
  const { t } = useTranslation();
  const { data, status, fetchApiData } = useIntegrationField();
  const hasFetchedInitialData = useRef(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [endpoint, setEndpoint] = useState(
    integrationFieldConfig?.endpoint || ""
  );
  const [headers, setHeaders] = useState<IntegrationRequestHeaders | null>(
    integrationFieldConfig?.headers || null
  );
  const [type, setType] = useState<IntegrationTypes | null>(
    integrationFieldConfig?.type || null
  );
  const [keyPaths, setKeyPaths] = useState<IntegrationKeyPaths | null>(
    integrationFieldConfig?.keyPaths || null
  );
  const [apiData, setApiData] = useState<any | null>(null);

  const isConnected = !!endpoint && !!type;
  const isFetchingApiData = status === "connecting";

  const onSave = useCallback(() => {
    const newData = {
      endpoint: endpoint,
      headers: headers,
      type: type,
      keyPaths: keyPaths,
    };
    onChange(newData);
    setIsFormOpen(false);
  }, [endpoint, headers, type, keyPaths, onChange]);

  const onClose = useCallback(() => {
    setEndpoint(integrationFieldConfig?.endpoint || "");
    setHeaders(integrationFieldConfig?.headers || null);
    setType(integrationFieldConfig?.type || null);
    setKeyPaths(integrationFieldConfig?.keyPaths || null);
    hasFetchedInitialData.current = false;
    setIsFormOpen(false);
  }, [integrationFieldConfig]);

  const onOpen = useCallback(() => {
    setIsFormOpen(true);
    setActiveStep(!isUpdate ? 0 : 1);
  }, [isUpdate]);

  useEffect(() => {
    if (
      !!isUpdate &&
      !!integrationFieldConfig?.endpoint &&
      !isFetchingApiData &&
      !hasFetchedInitialData.current
    ) {
      setEndpoint(integrationFieldConfig?.endpoint || "");
      setHeaders(integrationFieldConfig?.headers || null);
      setType(integrationFieldConfig?.type || null);
      setKeyPaths(integrationFieldConfig?.keyPaths || null);

      const options = !integrationFieldConfig?.headers
        ? {}
        : {
            headers: integrationFieldConfig?.headers,
          };
      fetchApiData(integrationFieldConfig?.endpoint, options);
      hasFetchedInitialData.current = true;
    }
  }, [isUpdate, integrationFieldConfig, isFetchingApiData, fetchApiData]);

  useEffect(() => {
    setApiData(data);
  }, [data]);

  const renderStep = useCallback(() => {
    switch (activeStep) {
      case 0:
        return (
          <ConnectToApi
            activeStep={activeStep}
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            headers={headers}
            setHeaders={setHeaders}
            setApiData={setApiData}
            setActiveStep={setActiveStep}
            closeForm={onClose}
          />
        );
      case 1:
        return (
          <SelectDisplayOptions
            activeStep={activeStep}
            endpoint={endpoint}
            type={type}
            setType={setType}
            setActiveStep={setActiveStep}
            closeForm={onClose}
            resetKeyPaths={() => setKeyPaths(null)}
          />
        );
      case 2:
        return (
          <ConfigureDisplayOptions
            type={type}
            keyPaths={keyPaths}
            setKeyPaths={setKeyPaths}
            apiData={apiData}
            closeForm={onClose}
            setActiveStep={setActiveStep}
            onSave={onSave}
          />
        );
      default:
        return null;
    }
  }, [
    activeStep,
    endpoint,
    headers,
    type,
    keyPaths,
    apiData,
    onClose,
    fetchApiData,
    onSave,
  ]);

  return (
    <Box>
      {isUpdate || isConnected ? (
        <>
          <Typography variant="h6" mb={1}>
            {t("shell.integrationApiConfigurationSettings")}
          </Typography>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{ borderRadius: 2, borderColor: "border" }}
          >
            <Box
              display="flex"
              alignItems="center"
              p={2}
              borderBottom="1px solid"
              borderColor="border"
            >
              <Typography width={170} variant="body2" fontWeight={600}>
                {t("shell.integrationApiUrl")}
              </Typography>
              <InputBase
                data-cy="integrationApiUrl"
                readOnly
                value={endpoint}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  input: {
                    sx: {
                      color: "text.secondary",
                    },
                  },
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" p={2}>
              <Typography width={170} variant="body2" fontWeight={600}>
                {t("shell.integrationDisplayItemsAs")}
              </Typography>
              <InputBase
                data-cy="integrationDisplayType"
                readOnly
                value={type}
                sx={{ flexGrow: 1 }}
                slotProps={{
                  input: {
                    sx: {
                      color: "text.secondary",
                      textTransform: "capitalize",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </>
      ) : null}

      <Button
        data-cy="integrationConfigureButton"
        variant="outlined"
        color="primary"
        startIcon={isConnected ? <Autorenew /> : <LinkRounded />}
        onClick={onOpen}
        sx={{ mt: 1 }}
        loading={isFetchingApiData}
        loadingPosition="start"
      >
        {isUpdate
          ? t("shell.integrationReconfigureDisplayOptions")
          : isConnected
          ? t("shell.integrationReconfigure")
          : t("shell.integrationConnectToApi")}
      </Button>
      {!!error && (
        <Typography variant="body2" color="error.main" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
      {isFormOpen && (
        <Dialog
          open
          data-cy="integrationFormDialog"
          onClose={onClose}
          fullWidth
          slotProps={{
            root: {
              className: "IntegrationConfigForm",
              disablePortal: true,
              keepMounted: false,
            },
            paper: {
              elevation: 0,
              sx: {
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
          {renderStep()}
        </Dialog>
      )}
    </Box>
  );
};

export default IntegrationFieldConfigure;
