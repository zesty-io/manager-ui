import { useTranslation } from "react-i18next";
import { useCallback, useRef, useState, ChangeEvent } from "react";
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
import { FormWrapper } from "../Shared/FormWrapper";
import { FieldWrapper } from "../Shared/FieldWrapper";
import {
  IntegrationKeyPaths,
  IntegrationRequestHeaders,
} from "../../../services/types";
import { validateUrl } from "utility/validateUrl";
import useIntegrationField from "../useIntegrationField";
import { v4 as uuidv4 } from "uuid";
import { doKeyPathsResolve } from "./keyPathResolution";

const CONNECTION_STATUSES: {
  [key: string]: {
    icon: React.ReactNode;
    titleKey: string;
    subTitleKey: string;
    buttonLabelKey: string;
    buttonIcon: React.ReactNode;
    variant: "contained" | "outlined";
    color: "primary" | "inherit";
  };
} = {
  connecting: {
    icon: <CircularProgress size={32} />,
    titleKey: "shell.integrationConnectingToApiEndpoint",
    subTitleKey: "shell.integrationConnectingSecureConnection",
    buttonLabelKey: "shell.integrationStop",
    buttonIcon: <StopRoundedIcon fontSize="small" color="inherit" />,
    variant: "outlined",
    color: "inherit",
  },
  success: {
    icon: <CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} />,
    titleKey: "shell.integrationConnectionSuccessful",
    subTitleKey: "shell.integrationConnectionSuccessfulDescription",
    buttonLabelKey: "common.next",
    buttonIcon: <ArrowForwardRoundedIcon fontSize="small" />,
    variant: "contained",
    color: "primary",
  },
  failed: {
    icon: (
      <InfoRoundedIcon fontSize="large" color="error" sx={{ fontSize: 40 }} />
    ),
    titleKey: "shell.integrationConnectionFailed",
    subTitleKey: "shell.integrationConnectionFailedDescription",
    buttonLabelKey: "shell.integrationTryAgain",
    buttonIcon: <AutorenewRoundedIcon fontSize="small" sx={{ fontSize: 40 }} />,
    variant: "contained",
    color: "primary",
  },
  invalid: {
    icon: (
      <InfoRoundedIcon fontSize="large" color="error" sx={{ fontSize: 40 }} />
    ),
    titleKey: "shell.integrationInvalidResponseFormat",
    subTitleKey: "shell.integrationInvalidResponseFormatDescription",
    buttonLabelKey: "shell.integrationTryAgain",
    buttonIcon: <AutorenewRoundedIcon sx={{ fontSize: 40 }} />,
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
  isUpdate = false,
  keyPaths = null,
}: {
  activeStep: number;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
  headers: IntegrationRequestHeaders;
  setHeaders: (headers: IntegrationRequestHeaders | null) => void;
  setApiData: (data: any) => void;
  setActiveStep: (step: number) => void;
  closeForm?: () => void;
  isUpdate?: boolean;
  keyPaths?: IntegrationKeyPaths | null;
}) => {
  const { t } = useTranslation();
  const focusRef = useRef<string>("url");
  const { data, status, invalidReason, fetchApiData } = useIntegrationField();

  const [isValidUrl, setIsValidUrl] = useState(true);
  const [reqAborted, setReqAborted] = useState<boolean>(false);

  const [endpointLocal, setEndpointLocal] = useState<string>(endpoint || "");

  const [headersLocal, setHeadersLocal] = useState<
    Record<string, { key: string; value: string }>
  >(() => {
    if (!headers || Object.keys(headers).length === 0) {
      const id = uuidv4();
      return { [id]: { key: "", value: "" } };
    }
    return Object.entries(headers).reduce((acc, [key, value]) => {
      const id = uuidv4();
      acc[id] = { key, value: String(value) };
      return acc;
    }, {} as Record<string, { key: string; value: string }>);
  });

  const handleNext = () => {
    const headersWithKeys = Object.values(headersLocal).filter((h) => !!h.key);
    const reqHeaders = !headersWithKeys.length
      ? null
      : headersWithKeys.reduce<Record<string, string>>(
          (acc, { key, value }) => {
            acc[key] = value;
            return acc;
          },
          {}
        );

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

  const keyPathsMismatch =
    status === "success" &&
    isUpdate &&
    !!keyPaths &&
    !doKeyPathsResolve(data, keyPaths);

  const handleApiConnect = useCallback(() => {
    setReqAborted(false);
    setApiData(null);
    const headersWithKeys = Object.values(headersLocal).filter((h) => !!h.key);
    const options = !headersWithKeys.length
      ? {}
      : {
          headers: headersWithKeys.reduce<Record<string, string>>(
            (acc, { key, value }) => {
              acc[key] = value;
              return acc;
            },
            {}
          ),
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
            borderRadius: 5,
            backgroundColor: "deepOrange.50",
            display: "block",
            width: "40px",
            height: "40px",
            mb: 1.5,
          }}
        />
        <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
          {t("shell.integrationConnectToApi")}
        </Typography>
        <Typography sx={{ my: 0.5 }} variant="body2" color="text.secondary">
          {t("shell.integrationConnectToApiDescription")}
        </Typography>
        <Box
          display="flex"
          flexDirection="row"
          columnGap={1}
          justifyContent="flex-start"
          alignItems="center"
          component={Link}
          href="https://docs.zesty.io/docs/how-to-use-the-integration-field"
          target="_blank"
        >
          <MenuBookRoundedIcon color="info" />
          <Typography variant="body2" color="info.dark">
            {t("shell.integrationLearnEndpointStructures")}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FieldWrapper
          label={t("shell.integrationApiUrl")}
          isRequired={true}
          toolTip={t("shell.integrationApiUrlTooltip")}
          name="integrationUrl"
        >
          <TextField
            data-cy="integrationEndpointInput"
            fullWidth
            size="small"
            autoFocus={focusRef?.current === "url"}
            placeholder="https://api.example.com/endpoint"
            value={endpointLocal}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
              !isValidUrl ? t("shell.integrationInvalidUrlHelper") : ""
            }
          />
        </FieldWrapper>
        <Divider orientation="horizontal" sx={{ my: 1, border: "none" }} />
        <FieldWrapper
          label={t("shell.integrationHttpHeadersOptional")}
          toolTip={t("shell.integrationAuthenticationHeaders")}
        >
          <Grid
            container
            spacing={1}
            columns={16}
            width="100%"
            data-cy="integrationHeadersContainer"
          >
            {Object.entries(headersLocal).map(([entryId, header], i) => (
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
                    autoFocus={entryId === focusRef.current}
                    className="keyInput"
                    fullWidth
                    size="small"
                    placeholder={t("shell.integrationKey")}
                    value={header.key}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setHeadersLocal((prev) => ({
                        ...prev,
                        [entryId]: { ...prev[entryId], key: e.target.value },
                      }));
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
                    placeholder={t("shell.integrationValue")}
                    value={header.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setHeadersLocal((prev) => ({
                        ...prev,
                        [entryId]: { ...prev[entryId], value: e.target.value },
                      }));
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
            ))}
          </Grid>
          <Button
            data-cy="addHeaderButton"
            fullWidth
            variant="outlined"
            startIcon={<AddCircleIcon />}
            onClick={() => {
              const keyId: string = uuidv4();
              focusRef.current = keyId;
              setHeadersLocal((prev) => ({
                ...prev,
                [keyId]: { key: "", value: "" },
              }));
            }}
          >
            {t("shell.integrationAddHttpHeader")}
          </Button>
        </FieldWrapper>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={closeForm}>
          {t("common.cancel")}
        </Button>
        <Button
          data-cy="integrationConnectButton"
          variant="contained"
          onClick={handleApiConnect}
          startIcon={<LinkRoundedIcon />}
          disabled={!endpointLocal || !isValidUrl}
        >
          {t("shell.integrationConnect")}
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
              {t(CONNECTION_STATUSES[status].titleKey)}
            </Typography>
            <Typography
              data-cy="integrationConnectionStatusSubtitle"
              variant="body2"
              color="text.primary"
              fontWeight={400}
              textAlign="center"
            >
              {status === "invalid"
                ? invalidReason
                : t(CONNECTION_STATUSES[status].subTitleKey)}
            </Typography>
            {keyPathsMismatch && (
              <Typography
                data-cy="integrationKeyPathsMismatchWarning"
                variant="body2"
                color="warning.dark"
                fontWeight={500}
                textAlign="center"
                sx={{ mt: 1 }}
              >
                {t("shell.integrationKeyPathsMismatchWarning")}
              </Typography>
            )}
          </Box>
          <Button
            data-cy="integrationConnectionStatusButton"
            startIcon={CONNECTION_STATUSES[status].buttonIcon}
            onClick={status === "success" ? handleNext : handleAbort}
            variant={CONNECTION_STATUSES[status].variant}
            color={CONNECTION_STATUSES[status].color}
            size="small"
          >
            {t(CONNECTION_STATUSES[status].buttonLabelKey)}
          </Button>
        </Paper>
      )}
    </FormWrapper>
  );
};
export default ConnectToApi;
