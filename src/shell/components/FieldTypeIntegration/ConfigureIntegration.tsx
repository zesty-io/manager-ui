import { FC, useEffect, useState } from "react";
import { Box, Typography, Button, Paper, InputBase } from "@mui/material";
import { FormTypes } from "./configs";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { useIntegrationField } from "./IntegrationFieldProvider";
import IntegrationForm from "./forms/IntegrationForm";
import { FormValue } from "../../../apps/schema/src/app/components/AddFieldModal/views/FieldForm";

import { FieldWrapper } from "./forms/FieldWrapper";
import {
  IntegrationFieldApiConfig,
  IntegrationFieldDisplay,
} from "../../services/types";

type IntegrationFieldProps = {
  name: string;
  label: string;
  description?: string;
  formType: FormTypes;
  required?: boolean;
  onChange?: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  error?: string | [string, string][] | null;
  isLoading?: boolean;
  integrationFieldApiConfig?: IntegrationFieldApiConfig | null;
  integrationFieldDisplay?: IntegrationFieldDisplay | null;
};

const ConfigureIntegration: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  onChange,
  required,
  error,
  formType = "configure",
  isLoading = false,
  integrationFieldApiConfig = null,
  integrationFieldDisplay = null,
}) => {
  const [defaultLoaded, setDefaultLoaded] = useState(false);

  const {
    isFormOpen,
    openForm,
    isConnected,
    setActiveStep,
    setEndpoint,
    setHeaders,
    setKeyPaths,
    setDisplayType,
    apiConfig,
    displayConfig,
  } = useIntegrationField();

  useEffect(() => {
    onChange({
      inputName: "integrationFieldApiConfig",
      value: apiConfig,
    });
  }, [apiConfig]);

  useEffect(() => {
    onChange({
      inputName: "integrationFieldDisplay",
      value: displayConfig,
    });
  }, [displayConfig]);

  useEffect(() => {
    if (isLoading || defaultLoaded) return;
    setEndpoint(integrationFieldApiConfig?.endpoint || "");
    setHeaders(integrationFieldApiConfig?.headers || null);
    setKeyPaths(integrationFieldDisplay?.keyPaths || null);
    setDisplayType(integrationFieldDisplay?.type || null);
    setDefaultLoaded(true);
  }, [
    integrationFieldApiConfig,
    integrationFieldDisplay,
    isLoading,
    defaultLoaded,
  ]);

  return (
    <FieldWrapper
      name={name}
      label={!!isConnected && label}
      description={!!isConnected && description}
      isRequired={!!isConnected && required}
      error={error as string}
    >
      {!!isConnected && (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            width: "100%",
            bgcolor: "background.paper",
            borderColor: "border",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              height: "54px",
              px: 2,
              borderBottom: "1px solid",
              borderColor: "border",
            }}
          >
            <Typography
              width={170}
              variant="body2"
              fontWeight={600}
              flexGrow={0}
              flexShrink={0}
            >
              API URL
            </Typography>
            <InputBase
              data-cy="integrationApiUrl"
              size="small"
              readOnly
              value={apiConfig?.endpoint || ""}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  sx: {
                    padding: 0,
                  },
                },
              }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              width: "100%",
              height: "54px",
              px: 2,
            }}
          >
            <Typography
              width={170}
              variant="body2"
              fontWeight={600}
              flexGrow={0}
              flexShrink={0}
            >
              Display Items as
            </Typography>
            <InputBase
              data-cy="integrationDisplayType"
              size="small"
              readOnly
              value={displayConfig?.type || ""}
              sx={{ flexGrow: 1 }}
              slotProps={{
                input: {
                  sx: {
                    textTransform: "capitalize",
                    padding: 0,
                  },
                },
              }}
            />
          </Box>
        </Paper>
      )}

      <Button
        data-cy="integrationConfigureButton"
        variant="outlined"
        color="primary"
        size="small"
        fullWidth={false}
        startIcon={
          !!isConnected ? <AutorenewRoundedIcon /> : <LinkRoundedIcon />
        }
        onClick={() => {
          setActiveStep(1);
          openForm();
        }}
      >
        {!!isConnected ? "Reconfigure" : "Connect to API"}
      </Button>

      {isFormOpen && <IntegrationForm />}
    </FieldWrapper>
  );
};

export default ConfigureIntegration;
