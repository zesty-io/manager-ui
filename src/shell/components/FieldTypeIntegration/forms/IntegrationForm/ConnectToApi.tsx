import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  DialogContent,
  DialogActions,
  DialogTitle,
  TextField,
  Grid,
  Link,
  Divider,
  Paper,
} from "@mui/material";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import CircularProgress from "@mui/material/CircularProgress";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { FormWrapper } from ".";
import { FieldWrapper } from "../FieldWrapper";
import {
  arrayToKeyValuePairs,
  keyValuePairsToArray,
  validateUrl,
} from "../../utils";

const CONNECTION_STATUSES: {
  [key: string]: {
    icon: React.ReactNode;
    title: string;
    subTitle: string;
    buttonLabel: string;
    buttonIcon: React.ReactNode;
    variant: "contained" | "outlined";
    color: "primary" | "inherit";
  };
} = {
  connecting: {
    icon: <CircularProgress size={32} />,
    title: "Connecting to API Endpoint",
    subTitle: "Please wait while we establish a secure connection",
    buttonLabel: "Stop",
    buttonIcon: <StopRoundedIcon fontSize="small" color="inherit" />,
    variant: "outlined",
    color: "inherit",
  },
  success: {
    icon: <CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} />,
    title: "Connection Successful",
    subTitle: "Your API is now securely linked and ready to be used.",
    buttonLabel: "Next",
    buttonIcon: <ArrowForwardRoundedIcon fontSize="small" />,
    variant: "contained",
    color: "primary",
  },
  failed: {
    icon: (
      <InfoRoundedIcon fontSize="large" color="error" sx={{ fontSize: 40 }} />
    ),
    title: "Connection Failed",
    subTitle:
      "We couldn't connect to the API endpoint you entered. This may be due to an unexpected structure, a missing or invalid URL, or incorrect custom integrationHeaders.",
    buttonLabel: "Try Again",
    buttonIcon: <AutorenewRoundedIcon fontSize="small" sx={{ fontSize: 40 }} />,
    variant: "contained",
    color: "primary",
  },
};

const ConnectToApi = () => {
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqAborted, setReqAborted] = useState<boolean>(false);

  const {
    integrationHeaders,
    setActiveStep,
    setIntegrationEndpoint,
    closeForm,
    setIntegrationHeaders,
    setApiData,
    setIsConnected,
    queryApi,
    defaultConfig,
  } = useIntegrationField();

  const [integrationEndpointLocal, setIntegrationEndpointLocal] =
    useState<string>("");

  const [integrationHeadersLocal, setIntegrationHeadersLocal] = useState<
    { key: string; value: string }[] | null
  >(keyValuePairsToArray(defaultConfig?.integrationRequestHeaders || []));

  const handleApiConnect = useCallback(async () => {
    setReqAborted(false);
    setStatus("connecting");
    const reqHeaders = arrayToKeyValuePairs(integrationHeadersLocal);
    try {
      const { status, data } = await queryApi({
        endpoint: integrationEndpointLocal,
        headers: reqHeaders,
      });

      if (status === "success") {
        setApiData(data);
        setStatus("success");
        setIsConnected(true);
      } else {
        throw new Error("Failed to connect");
      }
    } catch (error) {
      setReqError(error);
      setApiData(null);
      setStatus("failed");
    }
  }, [integrationEndpointLocal, integrationHeadersLocal]);

  const handleNext = () => {
    if (!!integrationHeadersLocal?.length) {
      const reqHeaders = arrayToKeyValuePairs(integrationHeadersLocal);
      setIntegrationHeaders(reqHeaders);
    }
    setIntegrationEndpoint(integrationEndpointLocal);
    setReqAborted(false);
    setIsConnected(true);
    setActiveStep(2);
  };
  const handleAbort = () => {
    setReqAborted(true);
    setStatus(null);
    setActiveStep(1);
  };

  useEffect(() => {
    if (
      !integrationHeaders ||
      (!!integrationHeaders && !Object.keys(integrationHeaders)?.length)
    )
      return;
    const convertedHeaders = keyValuePairsToArray(integrationHeaders);
    setIntegrationHeadersLocal(convertedHeaders);
  }, [integrationHeaders]);

  return (
    <FormWrapper width="480px" height="600px">
      <DialogTitle component="div">
        <DataObjectRoundedIcon
          color="primary"
          sx={{
            padding: 1,
            borderRadius: "20px",
            backgroundColor: "deepOrange.50",
            display: "block",
            width: "40px",
            height: "40px",
            mb: 1.5,
          }}
        />
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
          Connect to API
        </Typography>
        <Typography sx={{ my: 0.5 }} variant="body2" color="text.secondary">
          Establish a connection to an endpoint for users to select items from
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          columnGap={1}
          justifyContent="flex-start"
          alignItems="center"
          component={Link}
          href="#"
        >
          <MenuBookRoundedIcon color="info" />
          <Typography variant="body2" color="info.dark">
            Learn about endpoint structures we accept
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FieldWrapper
          label="API URL"
          isRequired={true}
          toolTip="URL defining the external data source. Must return a JSON array of flat objects with a consistent shape."
          name="integrationUrl"
        >
          <TextField
            data-cy="integrationEndpointInput"
            fullWidth
            size="small"
            autoFocus
            placeholder="https://api.example.com/endpoint"
            value={integrationEndpointLocal}
            onInput={(e: any) => {
              const validUrl = !!e.target.value && validateUrl(e.target.value);
              console.debug("integrationUrl changed", e.target.value, validUrl);
              setIsValidUrl(validUrl);
              setIntegrationEndpointLocal(e.target.value);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <LinkRoundedIcon
                    fontSize="small"
                    color="action"
                    sx={{ mr: 0.5 }}
                  />
                ),
                sx: {
                  py: 1,
                },
              },
            }}
            error={!isValidUrl}
            helperText={
              !isValidUrl
                ? "Please enter a valid URL. e.g. https://api.example.org/items.json"
                : ""
            }
          />
        </FieldWrapper>
        <Divider orientation="horizontal" sx={{ my: 1, border: "none" }} />
        <FieldWrapper
          label="Headers (if applicable)"
          toolTip="Authentication Headers"
        >
          <Grid
            container
            spacing={1}
            columns={16}
            width="100%"
            data-cy="integrationHeadersContainer"
          >
            {[...new Array(5)].map((_, i) => (
              <Grid
                data-cy={`integrationHeadersContainerRow-${i}`}
                key={`header-${i}`}
                container
                size={16}
                spacing={1}
                columns={16}
                width="100%"
              >
                <Grid size={8}>
                  <TextField
                    className="keyInput"
                    fullWidth
                    size="small"
                    placeholder="Key"
                    value={integrationHeadersLocal?.[i]?.key || ""}
                    onChange={(e) => {
                      const newHeaders = integrationHeadersLocal
                        ? [...integrationHeadersLocal]
                        : [];
                      newHeaders[i] = {
                        ...newHeaders[i],
                        key: e.target.value,
                        value: integrationHeadersLocal?.[i]?.value || "",
                      };
                      setIntegrationHeadersLocal(newHeaders);
                    }}
                  />
                </Grid>
                <Grid size={8}>
                  <TextField
                    className="valueInput"
                    fullWidth
                    size="small"
                    placeholder="Value"
                    value={integrationHeadersLocal?.[i]?.value || ""}
                    onChange={(e) => {
                      const newHeaders = integrationHeadersLocal
                        ? [...integrationHeadersLocal]
                        : [];
                      newHeaders[i] = {
                        ...newHeaders[i],
                        value: e.target.value || "",
                      };
                      setIntegrationHeadersLocal(newHeaders);
                    }}
                  />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </FieldWrapper>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={closeForm}>
          Cancel
        </Button>
        <Button
          data-cy="integrationConnectButton"
          variant="contained"
          onClick={handleApiConnect}
          startIcon={<LinkRoundedIcon />}
          disabled={!integrationEndpointLocal || !isValidUrl}
        >
          Connect
        </Button>
      </DialogActions>
      {!!status && !reqAborted && (
        <Paper
          data-cy="integrationConnectionStatusContainer"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            rowGap: 0.5,
            p: 4,
          }}
        >
          {CONNECTION_STATUSES?.[status]?.icon || null}
          <Box
            width="100%"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              rowGap: 0.5,
              pt: 3,
              pb: 2,
            }}
          >
            <Typography
              data-cy="integrationConnectionStatusLabel"
              variant="h5"
              color="text.primary"
              fontWeight={600}
              noWrap
            >
              {CONNECTION_STATUSES[status].title}
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              fontWeight={400}
              textAlign="center"
            >
              {CONNECTION_STATUSES[status].subTitle}
            </Typography>
          </Box>
          <Button
            data-cy="integrationConnectionStatusButton"
            startIcon={CONNECTION_STATUSES[status].buttonIcon}
            onClick={status === "success" ? handleNext : handleAbort}
            variant={CONNECTION_STATUSES[status].variant}
            color={CONNECTION_STATUSES[status].color}
            size="small"
          >
            {CONNECTION_STATUSES[status].buttonLabel}
          </Button>
        </Paper>
      )}
    </FormWrapper>
  );
};
export default ConnectToApi;
