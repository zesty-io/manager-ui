import { useCallback, useRef, useState } from "react";
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
  IconButton,
  FormHelperTextProps,
} from "@mui/material";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import CircularProgress from "@mui/material/CircularProgress";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { FormWrapper, FieldWrapper } from "../components/Wrappers";
import { IntegrationRequestHeaders } from "../../../services/types";
import { validateUrl } from "../../../../utility/validateUrl";
import useIntegrationField from "../useIntegrationField";

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

const ConnectToApi = ({
  activeStep,
  endpoint,
  setEndpoint,
  headers,
  setHeaders,
  setApiData,
  setActiveStep,
  closeForm,
}: {
  activeStep: number;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  headers: IntegrationRequestHeaders;
  setHeaders: (headers: IntegrationRequestHeaders | null) => void;
  setApiData: (data: any) => void;
  setActiveStep: (step: number) => void;
  closeForm?: () => void;
}) => {
  const focusRef = useRef<string>("url");
  const { data, status, fetchApiData } = useIntegrationField();

  const [isValidUrl, setIsValidUrl] = useState(true);
  const [reqAborted, setReqAborted] = useState<boolean>(false);

  const [endpointLocal, setEndpointLocal] = useState<string>(endpoint || "");

  const [headersLocal, setHeadersLocal] = useState<
    Record<string, { key: string; value: string }>
  >(() => {
    if (!headers || Object.keys(headers).length === 0) {
      const id = Date.now().toString();
      return { [id]: { key: "", value: "" } };
    }

    return Object.entries(headers).reduce((acc, [key, value]) => {
      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      acc[id] = { key, value: String(value) };
      return acc;
    }, {} as Record<string, { key: string; value: string }>);
  });

  const handleNext = () => {
    const headersLocalValues = Object.values(headersLocal);
    const headersWithKeys = headersLocalValues.filter((i) => !!i?.key);
    const reqHeaders = !headersWithKeys?.length
      ? null
      : headersWithKeys?.reduce((acc: any, obj: any) => {
          acc[obj.key] = obj.value;
          return acc;
        }, {});

    setApiData(data);
    setHeaders(reqHeaders);
    setEndpoint(endpointLocal);
    setReqAborted(false);
    setActiveStep(activeStep + 1);
  };
  const handleAbort = () => {
    setReqAborted(true);
    setActiveStep(0);
  };

  const handleApiConnect = useCallback(() => {
    setReqAborted(false);
    setApiData(null);
    const headersLocalValues = Object.values(headersLocal);
    const headersWithKeys = headersLocalValues.filter((i) => !!i?.key);
    const options = !headersWithKeys?.length
      ? {}
      : {
          headers: headersWithKeys?.reduce((acc: any, obj: any) => {
            acc[obj.key] = obj.value;
            return acc;
          }, {}),
        };
    fetchApiData(endpointLocal, options);
  }, [endpointLocal, headersLocal]);

  return (
    <FormWrapper width="480px" height="fit-content">
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
            autoFocus={focusRef?.current === "url"}
            placeholder="https://api.example.com/endpoint"
            value={endpointLocal}
            onInput={(e: any) => {
              const validUrl = !!e.target.value && validateUrl(e.target.value);
              setIsValidUrl(validUrl);
              setEndpointLocal(e.target.value);
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
              },
              formHelperText: {
                "data-cy": "integrationEndpointHelperText",
              } as FormHelperTextProps,
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
          label="HTTP Headers (optional)"
          toolTip="Authentication Headers"
        >
          <Grid
            container
            spacing={1}
            columns={16}
            width="100%"
            data-cy="integrationHeadersContainer"
          >
            {Object.entries(headersLocal)?.map((entry, i) => {
              const entryId: string = entry[0];
              const headerKey = entry[1]?.key || "";
              const headerValue = entry[1]?.value || "";
              return (
                <Grid
                  data-cy={`integrationHeadersContainerRow-${i}`}
                  key={`header-${entryId}`}
                  container
                  size={16}
                  spacing={1}
                  columns={16}
                  width="100%"
                >
                  <Grid size={8}>
                    <TextField
                      autoFocus={entryId === focusRef?.current}
                      className="keyInput"
                      fullWidth
                      size="small"
                      placeholder="Key"
                      value={headerKey}
                      onChange={(e: any) => {
                        setHeadersLocal({
                          ...headersLocal,
                          [entryId]: {
                            ...headersLocal?.[entryId],
                            key: e.target.value,
                          },
                        });
                      }}
                    />
                  </Grid>
                  <Grid
                    size={i > 0 ? 7 : 8}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <TextField
                      className="valueInput"
                      size="small"
                      placeholder="Value"
                      value={headerValue}
                      onChange={(e: any) => {
                        setHeadersLocal({
                          ...headersLocal,
                          [entryId]: {
                            ...headersLocal?.[entryId],
                            value: e.target.value,
                          },
                        });
                      }}
                      sx={{ flexGrow: 1 }}
                    />
                  </Grid>
                  {i > 0 && (
                    <Grid
                      size={1}
                      display="flex"
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconButton
                        data-cy="removeHeaderButton"
                        sx={{ flexGrow: 0 }}
                        onClick={() => {
                          setHeadersLocal((prev) => {
                            if (!prev[entryId]) return prev;
                            const updated = { ...prev };
                            delete updated[entryId];
                            return updated;
                          });
                        }}
                      >
                        <CloseOutlinedIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              );
            })}
          </Grid>
          <Button
            data-cy="addHeaderButton"
            fullWidth
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={() => {
              const keyId: string = Date.now().toString();
              focusRef.current = keyId;
              setHeadersLocal({
                ...headersLocal,
                [keyId]: {
                  key: "",
                  value: "",
                },
              });
            }}
          >
            Add HTTP Header
          </Button>
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
          disabled={!endpointLocal || !isValidUrl}
        >
          Connect
        </Button>
      </DialogActions>
      {!!status && !reqAborted && (
        <Paper
          data-cy="integrationConnectionStatusContainer"
          elevation={0}
          sx={{
            borderRadius: 2,
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
