import { FC, useCallback, useEffect, useState } from "react";
import {
  Button,
  Box,
  Tooltip,
  Typography,
  DialogContent,
  DialogActions,
  DialogTitle,
  Dialog,
  TextField,
  Grid,
  Link,
  Divider,
  Slide,
  Grow,
  Paper,
  OutlinedInput,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import InfoIcon from "@mui/icons-material/Info";
import { useIntegrationField } from "../../IntegrationFieldProvider";
import CircularProgress from "@mui/material/CircularProgress";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import InsertLinkRoundedIcon from "@mui/icons-material/InsertLinkRounded";
import { FormWrapper } from ".";
import { IntegrationTypes, APIHeader, DEFAULT_HEADERS } from "../../configs";
import { FieldWrapper } from "../FieldWrapper";
import {
  getValuePaths,
  getKeyValuePairs,
  getObjectValue,
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
      "We couldn't connect to the API endpoint you entered. This may be due to an unexpected structure, a missing or invalid URL, or incorrect custom headers.",
    buttonLabel: "Try Again",
    buttonIcon: <AutorenewRoundedIcon fontSize="small" sx={{ fontSize: 40 }} />,
    variant: "contained",
    color: "primary",
  },
};

type ConnectToApiProps = {
  open?: boolean;
  onClose?: () => void;
};

const ConnectionStatus = ({
  status,
  error,
  next,
  stop,
}: {
  status: "connecting" | "success" | "failed" | null;
  error: string | null;
  next: () => void;
  stop: () => void;
}) => {
  const {
    integrationEndPoint,
    integrationType,
    setActiveStep,
    setIsConnected,
  } = useIntegrationField();

  const handleAction = () => {
    if (status === "success") {
      // setIntegrationConfig({
      //   url,
      //   type,
      // });
      setIsConnected(true);
      setActiveStep(2);
    } else if (status === "connecting") {
      stop();
    } else {
      stop();
    }
  };

  return (
    <Paper
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
      {/* <CircularProgress size={32} /> */}
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
        <Typography variant="h5" color="text.primary" fontWeight={600} noWrap>
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
        startIcon={CONNECTION_STATUSES[status].buttonIcon}
        onClick={handleAction}
        variant={CONNECTION_STATUSES[status].variant}
        color={CONNECTION_STATUSES[status].color}
        size="small"
      >
        {CONNECTION_STATUSES[status].buttonLabel}
      </Button>
    </Paper>
  );
};

const ConnectToApi = () => {
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [reqError, setReqError] = useState<string | null>(null);
  const [reqAborted, setReqAborted] = useState<boolean>(false);

  const {
    setActiveStep,
    integrationEndPoint,
    setIntegrationEndPoint,
    closeForm,
    headers,
    setHeaders,
    apiData,
    setApiData,

    dataPathOptions,
    setDataPathOptions,
    onChange,
  } = useIntegrationField();

  const [headersCount, setHeadersCount] = useState<number>(5);

  const handleApiConnect = useCallback(async () => {
    setReqAborted(false);
    setStatus("connecting");
    const reqHeaders = !headers?.length
      ? null
      : headers?.reduce((acc: any, header: any) => {
          acc[header.key] = header.value;
          return acc;
        }, {});
    const reqOptions = {
      method: "GET",
      ...(!!reqHeaders ? { headers: reqHeaders } : {}),
    };
    try {
      const res = await fetch(integrationEndPoint, reqOptions);
      if (res?.ok) {
        setStatus("success");
        const data = await res?.json();
        setApiData(data);

        const keyPathsRaw = getValuePaths(data).filter((item) => {
          const val = getObjectValue(data, item);
          return Array.isArray(val);
        });

        setDataPathOptions(keyPathsRaw);
      } else {
        throw new Error(res?.statusText);
      }
    } catch (error) {
      setReqError(error);
      setApiData(null);
      setStatus("failed");
    }
  }, [integrationEndPoint, headers]);
  useEffect(() => {
    setIntegrationEndPoint(
      "https://imdb232.p.rapidapi.com/api/news/get-by-category?limit=25&category=CELEBRITY"
    );
    setHeaders([
      {
        key: "x-rapidapi-key",
        value: "1affe04b49msh5e2438bb0baa009p10b8e8jsnbe0d01884692",
      },
      {
        key: "x-rapidapi-host",
        value: "imdb232.p.rapidapi.com",
      },
    ]);
    return () => {
      setStatus(null);
    };
  }, []);

  useEffect(() => {
    if (headers?.length > 5) {
      setHeadersCount(headers?.length);
    }
  }, [headers?.length]);

  return (
    <FormWrapper width="480px" height="600px">
      <DialogTitle>
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
            fullWidth
            size="small"
            autoFocus
            placeholder="https://api.example.com/endpoint"
            value={integrationEndPoint}
            onChange={(e) => {
              setIntegrationEndPoint(e.target.value);
              const validUrl = !e.target.value
                ? true
                : validateUrl(e.target.value);
              setIsValidUrl(validUrl);
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
          <Grid container spacing={1} columns={16} width="100%">
            {[...new Array(headersCount)].map((_, i) => (
              <Grid
                key={`header-${i}`}
                container
                size={16}
                spacing={1}
                columns={16}
                width="100%"
              >
                <Grid size={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Key"
                    value={headers?.[i]?.key || ""}
                    onChange={(e) => {
                      const newHeaders = headers ? [...headers] : [];
                      newHeaders[i] = {
                        ...newHeaders[i],
                        key: e.target.value,
                        value: headers?.[i]?.value || "",
                      };
                      setHeaders(newHeaders);
                    }}
                  />
                </Grid>
                <Grid size={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Value"
                    value={headers?.[i]?.value || ""}
                    onChange={(e) => {
                      const newHeaders = headers ? [...headers] : [];
                      newHeaders[i] = {
                        ...newHeaders[i],
                        value: e.target.value || "",
                      };
                      setHeaders(newHeaders);
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
          variant="contained"
          onClick={handleApiConnect}
          startIcon={<LinkRoundedIcon />}
          disabled={!integrationEndPoint || !isValidUrl}
        >
          Connect
        </Button>
      </DialogActions>
      {!!status && !reqAborted && (
        <ConnectionStatus
          status={status}
          error={reqError}
          next={() => {
            setReqAborted(false);
            setActiveStep(2);
          }}
          stop={() => {
            setReqAborted(true);
            setStatus(null);
            setActiveStep(1);
          }}
        />
      )}
    </FormWrapper>
  );
};
export default ConnectToApi;
