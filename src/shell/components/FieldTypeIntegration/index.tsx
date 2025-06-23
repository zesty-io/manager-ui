import { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  InputBase,
  OutlinedInput,
} from "@mui/material";
import { IntegrationTypes, FormTypes } from "./configs";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import IntegrationFieldProvider, {
  useIntegrationField,
} from "./IntegrationFieldProvider";
import IntegrationForm from "./forms";
import {
  Errors,
  FormValue,
} from "../../../apps/schema/src/app/components/AddFieldModal/views/FieldForm";
import { arrayToKeyValuePairs } from "./utils";
import AddIcon from "@mui/icons-material/Add";
import SelectionForm from "./forms/SelectionForm";
import { FieldWrapper } from "./forms/FieldWrapper";

type IntegrationDataProps = {
  url: string;
  // type: IntegrationType;
};

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
  // data?: IntegrationDataProps;
};

const ApiConfigurationSettings = ({
  url,
  displayType,
}: {
  url: string;
  displayType: IntegrationTypes;
}) => {
  return (
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
          <InputBase size="small" readOnly value={url} sx={{ flexGrow: 1 }} />
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
            value={`${displayType} Card` || ""}
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
  );
};

const IntegrationFieldComponent: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  formType,
  onChange,
  required,
  error,
}) => {
  // const [isFormOpen, setIsFormOpen] = useState(false);

  const isSelection = formType === "select";
  const isConfiguration = formType === "configure";

  const {
    isFormOpen,
    openForm,
    closeForm,
    integrationEndPoint,
    setIntegrationEndPoint,
    integrationType,
    setIntegrationType,
    headers: headersArray,
    isConnected,
    setIsConnected,
    setActiveStep,
    integrationConfig,
    remoteSelectorOpen,
    setRemoteSelectorOpen,
  } = useIntegrationField();

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
        {/* {!!isConnected && !!isConfiguration && (
          // <Box
          //   sx={{
          //     display: "flex",
          //     flexDirection: "column",
          //     justifyContent: "flex-start",
          //     alignItems: "flex-start",
          //     width: "100%",
          //     py: 1,
          //     rowGap: 1,
          //   }}
          // >
          //   <Typography variant="body2" fontWeight={600}>
          //     API Configuration Settings
          //   </Typography>
          //   <Paper
          //     elevation={0}
          //     variant="outlined"
          //     sx={{
          //       width: "100%",
          //       bgcolor: "background.paper",
          //       borderColor: "border",
          //       borderRadius: 2,
          //     }}
          //   >
          //     <Box
          //       sx={{
          //         display: "flex",
          //         flexDirection: "row",
          //         justifyContent: "flex-start",
          //         alignItems: "center",
          //         width: "100%",
          //         p: 2,
          //         borderBottom: "1px solid",
          //         borderColor: "border",
          //       }}
          //     >
          //       <Typography
          //         width={170}
          //         variant="body2"
          //         fontWeight={600}
          //         flexGrow={0}
          //         flexShrink={0}
          //       >
          //         API URL
          //       </Typography>
          //       <InputBase
          //         size="small"
          //         readOnly
          //         value={endpoint}
          //         sx={{ flexGrow: 1 }}
          //       />
          //     </Box>
          //     <Box
          //       sx={{
          //         display: "flex",
          //         flexDirection: "row",
          //         justifyContent: "flex-start",
          //         alignItems: "center",
          //         width: "100%",
          //         p: 2,
          //       }}
          //     >
          //       <Typography
          //         width={170}
          //         variant="body2"
          //         fontWeight={600}
          //         flexGrow={0}
          //         flexShrink={0}
          //       >
          //         Display Items as
          //       </Typography>
          //       <InputBase
          //         size="small"
          //         readOnly
          //         value={`${type} Card` || ""}
          //         sx={{ flexGrow: 1 }}
          //         slotProps={{
          //           input: {
          //             sx: {
          //               textTransform: "capitalize",
          //             },
          //           },
          //         }}
          //       />
          //     </Box>
          //   </Paper>
          // </Box>
          <ApiConfigurationSettings url={endpoint} displayType={type} />
        )} */}

        {!!isSelection ? (
          <FieldWrapper
            name={name}
            label={label}
            description={description}
            isRequired={true}
            // value={value}
          >
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth={true}
              startIcon={<AddIcon />}
              onClick={() => {
                setRemoteSelectorOpen(true);
              }}
            >
              Select Remote Items
            </Button>
            <SelectionForm
              ZUID="test"
              displayType="youtube"
              endpoint="s"
              headers={[]}
              title="SelectFromRemoteSource"
            />
          </FieldWrapper>
        ) : (
          <FieldWrapper
            name={name}
            label={!!isConnected && label}
            description={!!isConnected && description}
            isRequired={!!isConnected && required}
            // value={value}
          >
            {!!isConnected && (
              <ApiConfigurationSettings
                url={integrationEndPoint}
                displayType={integrationType}
              />
            )}
            <Button
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
            <IntegrationForm />
          </FieldWrapper>
        )}
      </Box>
    </>
  );
};

const FieldTypeIntegration: FC<IntegrationFieldProps> = ({
  name,
  label,
  description,
  onChange,
  required,
  error,
  formType = "configure",
}) => {
  return (
    <IntegrationFieldProvider onChange={onChange}>
      <IntegrationFieldComponent
        name={name}
        label={label}
        description={description}
        onChange={onChange}
        error={error}
        formType={formType}
      />
    </IntegrationFieldProvider>
  );
};

export default FieldTypeIntegration;
