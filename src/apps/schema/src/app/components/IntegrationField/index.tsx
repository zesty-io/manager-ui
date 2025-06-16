import { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  InputBase,
  OutlinedInput,
} from "@mui/material";
import { IntegrationFieldTypes, IntegrationConfig } from "./configs";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import IntegrationFieldProvider, {
  useIntegrationField,
} from "./IntegrationFieldProvider";
import IntegrationForm from "./IntegrationForm";
import { Errors, FormValue } from "../AddFieldModal/views/FieldForm";
import { arrayToKeyValuePairs } from "./utils";

type IntegrationDataProps = {
  url: string;
  // type: IntegrationFieldTypes;
};

type IntegrationFieldProps = {
  name: string;
  label: string;
  onChange: ({
    inputName,
    value,
  }: {
    inputName: string;
    value: FormValue;
  }) => void;
  error?: string | [string, string][] | null;
  // data?: IntegrationDataProps;
};

const IntegrationFieldComponent: FC<IntegrationFieldProps> = ({
  name,
  label,
  onChange,
  error,
}) => {
  // const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    isFormOpen,
    openForm,
    closeForm,
    endpoint,
    setEndpoint,
    type,
    setType,
    headers: headersArray,
    isConnected,
    setIsConnected,
    setActiveStep,
    integrationConfig,
  } = useIntegrationField();

  useEffect(() => {
    console.debug("MOUNTED");
    if (!isConnected || !type || !endpoint) return;

    const headers = arrayToKeyValuePairs(headersArray);

    onChange({ inputName: name, value: { endpoint, type, headers } });
    return () => {
      console.debug("UNMOUNTED");
    };
  }, [endpoint, type, headersArray, isConnected]);

  // useEffect(() => {
  //   return () => {
  //     // console.debug("unmounting IntegrationField");
  //     setIsConnected(false);
  //     setUrl(null);
  //     setType(null);
  //     setActiveStep(1);
  //   };
  // }, []);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {!!isConnected && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "100%",
              py: 1,
              rowGap: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              API Configuration Settings
            </Typography>
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
                  p: 2,
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
                  size="small"
                  readOnly
                  value={endpoint}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  p: 2,
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
                  size="small"
                  readOnly
                  value={`${type} Card` || ""}
                  sx={{ flexGrow: 1 }}
                  slotProps={{
                    input: {
                      sx: {
                        textTransform: "capitalize",
                      },
                    },
                  }}
                />
              </Box>
            </Paper>
          </Box>
        )}
        <Button
          variant="outlined"
          color="primary"
          size="small"
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
        {!!error ? (
          <Typography variant="body2" color="error.main" mt={0.5}>
            {error}
          </Typography>
        ) : null}
        {!!isFormOpen && <IntegrationForm />}
      </Box>
    </>
  );
};

const IntegrationField: FC<IntegrationFieldProps> = ({
  name,
  label,
  onChange,
  error,
}) => {
  return (
    <IntegrationFieldProvider>
      <IntegrationFieldComponent
        name={name}
        label={label}
        onChange={onChange}
        error={error}
      />
    </IntegrationFieldProvider>
  );
};

export default IntegrationField;
