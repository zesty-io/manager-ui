import { FC, useEffect, useState } from "react";
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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import InfoIcon from "@mui/icons-material/Info";
import { useIntegrationField } from "./IntegrationFieldProvider";
import CircularProgress from "@mui/material/CircularProgress";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import InsertLinkRoundedIcon from "@mui/icons-material/InsertLinkRounded";

const CONNECTION_STATUSES = {
  connecting: {
    icon: <CircularProgress size={32} />,
    title: "Connecting to API Endpoint",
    subTitle: "Please wait while we establish a secure connection",
    buttonLabel: "Stop",
    buttonIcon: <StopRoundedIcon fontSize="small" color="inherit" />,
  },
  success: {
    icon: <CheckCircleRoundedIcon color="success" sx={{ fontSize: 40 }} />,
    title: "Connection Successful",
    subTitle: "Your API is now securely linked and ready to be used.",
    buttonLabel: "Next",
    buttonIcon: <ArrowForwardRoundedIcon fontSize="small" />,
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
  },
};

type ConnectFormProps = {
  open?: boolean;
  onClose?: () => void;
};

const Wrapper = ({
  name,
  label,
  toolTip,
  isRequired,
  children,
}: {
  name?: string;
  label?: string;
  toolTip?: string;
  isRequired?: boolean;
  children: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        rowGap: 0.5,
      }}
    >
      <Typography
        variant="body2"
        color="text.primary"
        fontWeight={600}
        noWrap
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        {label}
        {isRequired && <span>*</span>}
        <Box component="span" sx={{ ml: 0.5 }}>
          <Tooltip title={toolTip} placement="top">
            <InfoIcon color="action" sx={{ fontSize: 12 }} />
          </Tooltip>
        </Box>
      </Typography>
      {children}
    </Box>
  );
};

const StatusConnecting = ({
  status,
  stop,
}: {
  status: "connecting" | "success" | "failed";
  stop: () => void;
}) => {
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
      {CONNECTION_STATUSES[status].icon}
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
        onClick={stop}
        variant={status === "connecting" ? "outlined" : "contained"}
        color={status === "connecting" ? "inherit" : "primary"}
        size="small"
      >
        {CONNECTION_STATUSES[status].buttonLabel}
      </Button>
    </Paper>
  );
};

const ConnectForm: FC<ConnectFormProps> = ({ open, onClose }) => {
  const [isOpenStatus, setIsOpenStatus] = useState(false);
  const [status, setStatus] = useState<
    "connecting" | "success" | "failed" | null
  >(null);

  const { setData } = useIntegrationField();

  useEffect(() => {
    return () => {
      setStatus(null);
      onClose();
    };
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
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
        <Typography component="div" sx={{ fontWeight: 700 }}>
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
          <Typography variant="body2" color="info.main">
            Learn about endpoint structures we accept
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Wrapper
          label="API URL"
          isRequired={true}
          toolTip="URL defining the external data source. Must return a JSON array of flat objects with a consistent shape."
        >
          <TextField
            name="apiEndpoint"
            fullWidth
            size="small"
            placeholder="https://api.example.com/endpoint"
            slotProps={{
              input: {
                autoFocus: true,
                startAdornment: (
                  <LinkRoundedIcon
                    color="inherit"
                    fontSize="small"
                    sx={{ mr: 1 }}
                  />
                ),
              },
            }}
          />
        </Wrapper>
        <Divider orientation="horizontal" sx={{ my: 1, border: "none" }} />
        <Wrapper
          label="Headers (if applicable)"
          toolTip="Authentication Headers"
        >
          <Grid container spacing={1} columns={16} width="100%">
            <Grid container size={16} spacing={1} columns={16} width="100%">
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Key" />
              </Grid>
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Value" />
              </Grid>
            </Grid>
            <Grid container size={16} spacing={1} columns={16} width="100%">
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Key" />
              </Grid>
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Value" />
              </Grid>
            </Grid>
            <Grid container size={16} spacing={1} columns={16} width="100%">
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Key" />
              </Grid>
              <Grid size={8}>
                <TextField fullWidth size="small" />
              </Grid>
            </Grid>
            <Grid container size={16} spacing={1} columns={16} width="100%">
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Key" />
              </Grid>
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Value" />
              </Grid>
            </Grid>
            <Grid container size={16} spacing={1} columns={16} width="100%">
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Key" />
              </Grid>
              <Grid size={8}>
                <TextField fullWidth size="small" placeholder="Value" />
              </Grid>
            </Grid>
          </Grid>
        </Wrapper>
      </DialogContent>
      <DialogActions>
        <Button
          color="inherit"
          onClick={() => {
            setStatus(null);
            onClose();
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={() => setStatus("connecting")}
          loading={false}
          startIcon={<LinkRoundedIcon />}
        >
          Connect
        </LoadingButton>
      </DialogActions>
      {!!status && (
        <StatusConnecting
          status={status}
          stop={() => {
            setData({
              url: "http://8-f48cf3a682-7fthvk.manager.dev.zesty.io:8080/schema/6-dc91b8ead8-j669kx/fields",
              type: "simple",
            });
            setStatus(null);
          }}
        />
      )}
    </Dialog>
  );
};
export default ConnectForm;
