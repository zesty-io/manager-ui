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
};

const ConfigureIntegration: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  onChange,
  required,
  error,
  isLoading = false,
}) => {
  const {
    isFormOpen,
    setIsFormOpen,
    isConnected,
    setActiveStep,
    config,
    endpoint,
    displayType,
  } = useIntegrationField();
  const [defaultLoaded, setDefaultLoaded] = useState(false);
  const isConfigured = isConnected && !!endpoint && !!displayType;

  useEffect(() => {
    if (config?.status === "completed") {
      onChange({
        inputName: "integrationFieldApiConfig",
        value: config?.api,
      });

      onChange({
        inputName: "integrationFieldDisplay",
        value: config?.display,
      });
    } else {
    }
  }, [config]);

  return (
    <FieldWrapper
      name={name}
      label={!!isConfigured && label}
      description={!!isConfigured && description}
      isRequired={!!isConfigured && required}
      error={error as string}
    >
      {!!isConfigured && (
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
              value={endpoint || ""}
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
              value={displayType || ""}
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
          !!isConfigured ? <AutorenewRoundedIcon /> : <LinkRoundedIcon />
        }
        onClick={() => {
          setActiveStep(1);
          setIsFormOpen(true);
        }}
      >
        {!!isConfigured ? "Reconfigure" : "Connect to API"}
      </Button>

      {isFormOpen && <IntegrationForm />}
    </FieldWrapper>
  );
};

export default ConfigureIntegration;
