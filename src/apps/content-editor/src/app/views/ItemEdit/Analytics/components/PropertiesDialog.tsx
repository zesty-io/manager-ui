import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Box,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Link,
  Button,
  ListItemAvatar,
  Avatar,
  ListItem,
  DialogActions,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import PersonRemoveRoundedIcon from "@mui/icons-material/PersonRemoveRounded";
import googleIcon from "../../../../../../../../../public/images/googleIcon.svg";
import {
  useDisconnectGoogleAnalyticsMutation,
  useGetAnalyticsPropertiesQuery,
} from "../../../../../../../../shell/services/cloudFunctions";
import {
  useCreateInstanceSettingsMutation,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingMutation,
} from "../../../../../../../../shell/services/instance";
import { NoSearchResults } from "../../../../../../../../shell/components/NoSearchResults";
import googleAnalyticsIcon from "../../../../../../../../../public/images/googleAnalyticsIcon.svg";
import { useSelector } from "react-redux";
import { AppState } from "../../../../../../../../shell/store/types";
import { AnalyticsDialog } from "./AnalyticsDialog";
import { LoadingButton } from "@mui/lab";
import { set } from "js-cookie";

type Message = {
  source: "zesty";
  status: number;
};

type Props = {
  onClose: (shouldNavAway?: boolean) => void;
};

let tabWindow: Window;

export const PropertiesDialog = ({ onClose }: Props) => {
  const user = useSelector((state: AppState) => state.user);
  const instance = useSelector((state: AppState) => state.instance);
  const [showSettings, setShowSettings] = useState(false);
  const [showResult, setShowResult] = useState(null);
  const [showDisconnectConfirmation, setShowDisconnectConfirmation] =
    useState(false);
  const { data, refetch } = useGetAnalyticsPropertiesQuery();
  const { data: instanceSettings } = useGetInstanceSettingsQuery();
  const [createInstanceSetting] = useCreateInstanceSettingsMutation();
  const [updateInstanceSetting] = useUpdateInstanceSettingMutation();
  const [disconnectGoogleAnalytics] = useDisconnectGoogleAnalyticsMutation();
  const property = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  );
  const [search, setSearch] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredData = data?.properties?.filter((property: any) =>
    property.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handlePropertySelection = (selectedProperty: any) => {
    if (property) {
      updateInstanceSetting({
        ...property,
        value: selectedProperty.name,
      }).then(() => onClose());
    } else {
      createInstanceSetting({
        category: "analytics",
        key: "google_property_id",
        keyFriendly: "Google Property ID",
        value: selectedProperty.name,
        dataType: "text",
      }).then(() => onClose());
    }
  };

  const receiveMessage = (event: MessageEvent<Message>) => {
    if (
      // @ts-ignore
      event.origin === CONFIG.CLOUD_FUNCTIONS_DOMAIN &&
      event.data.source === "zesty"
    ) {
      if (event.data.status === 200) {
        setShowResult(true);
      } else {
        setShowResult(false);
      }
      tabWindow.close();
    }
  };

  const initiate = () => {
    tabWindow?.close();
    tabWindow = window.open(
      // @ts-ignore
      `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/authenticateGoogleAnalytics?user_id=${user.ID}&account_id=${instance.ID}`
    );
  };

  useEffect(() => {
    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, []);

  if (showResult !== null) {
    if (showResult) {
      return (
        <AnalyticsDialog
          title={`Congratulations ${user.firstName}! You are successfully connected to Google Analytics`}
          subTitle="Get ready to gain insights on how your content changes have impacted your page traffic and more!"
          buttons={
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                // clear out existing property
                updateInstanceSetting({
                  ...property,
                  value: "",
                });
                refetch();
              }}
            >
              Get Started
            </Button>
          }
        />
      );
    } else {
      return (
        <AnalyticsDialog
          title={`Oops, we were unable to successfully connect to Google Analytics`}
          subTitle="This can because you may have selected a Google account that does not have Google Analytics setup."
          buttons={
            <>
              <Button
                variant="contained"
                color="inherit"
                size="large"
                onClick={() => setShowResult(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={<RefreshRoundedIcon />}
                onClick={() => {
                  setShowResult(null);
                  initiate();
                }}
              >
                Try Again
              </Button>
            </>
          }
        />
      );
    }
  }

  if (showDisconnectConfirmation) {
    return (
      <DisconnectConfirmationDialog
        onConfirm={() => {
          disconnectGoogleAnalytics().then(() => {
            updateInstanceSetting({
              ...property,
              value: "",
            });
            refetch();
            setShowDisconnectConfirmation(false);
          });
        }}
        onClose={() => setShowDisconnectConfirmation(false)}
      />
    );
  }

  return (
    <Dialog
      open
      onClose={() => onClose(true)}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: {
          minWidth: "800px",
          height: "100%",
          maxHeight: "min(100%, 1000px)",
          m: 0,
        },
      }}
    >
      {!showSettings ? (
        <>
          <DialogTitle>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              sx={{ mb: 1 }}
            >
              <Box width="640px">
                <Box
                  sx={{
                    backgroundColor: "blue.50",
                    borderRadius: "100%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LanguageRoundedIcon color="info" />
                </Box>
                <Typography variant="h5" fontWeight={600} sx={{ mt: 1.5 }}>
                  Select a Google Analytics Property
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1 }}
                  color="text.secondary"
                >
                  Please select the Google Analytics property you want to see
                  analytics and insights for
                </Typography>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ mt: 1.5 }}
                  InputProps={{
                    sx: {
                      backgroundColor: "grey.50",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: 0,
                      },
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    ref: inputRef,
                  }}
                  placeholder="Search Google Analytics Properties"
                  fullWidth
                />
              </Box>
              <Box display="flex" gap={1} alignItems="flex-start">
                <Button
                  onClick={() => setShowSettings(true)}
                  size="small"
                  color="inherit"
                  variant="outlined"
                  sx={{ whiteSpace: "nowrap" }}
                  startIcon={<SettingsRoundedIcon color="action" />}
                >
                  GA Settings
                </Button>
                <IconButton size="small" onClick={() => onClose(true)}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Stack>
            <Typography variant="h6" fontWeight="600" mt={2}>
              {filteredData?.length} Properties
            </Typography>
          </DialogTitle>
          <DialogContent>
            {filteredData?.length === 0 ? (
              <Box
                sx={{
                  height: "99%",
                  border: "1px solid",
                  borderColor: "border",
                  borderRadius: "8px",
                }}
              >
                <NoSearchResults
                  query={search}
                  ignoreFilters
                  hideBackButton
                  onSearchAgain={() => {
                    setSearch("");
                    inputRef?.current?.focus();
                  }}
                />
              </Box>
            ) : (
              <>
                <List
                  disablePadding
                  sx={{
                    border: "1px solid",
                    borderColor: "border",
                    borderRadius: "8px",
                  }}
                >
                  {filteredData?.map((property: any, index: number) => (
                    <ListItemButton
                      key={property.name}
                      divider={
                        index === filteredData?.length - 1 ? false : true
                      }
                      disableGutters
                      onClick={() => handlePropertySelection(property)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        borderColor: "border",
                      }}
                    >
                      <ListItemText
                        sx={{
                          m: 0,
                        }}
                        primary={property.displayName}
                        primaryTypographyProps={{
                          variant: "body2",
                        }}
                        secondary={
                          <React.Fragment>
                            {`${property.name.split("/").pop()} •  `}
                            <Link
                              href={
                                property?.dataStreams?.[0]?.webStreamData
                                  ?.defaultUri
                              }
                              target="__blank"
                            >
                              {
                                property?.dataStreams?.[0]?.webStreamData
                                  ?.defaultUri
                              }
                            </Link>
                          </React.Fragment>
                        }
                        secondaryTypographyProps={{
                          fontSize: "12px",
                          lineHeight: "18px",
                        }}
                      />
                      <ListItemIcon
                        sx={{
                          minWidth: "unset",
                        }}
                      >
                        <ArrowForwardIosRoundedIcon
                          fontSize="small"
                          color="action"
                        />
                      </ListItemIcon>
                    </ListItemButton>
                  ))}
                </List>
              </>
            )}
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box display="flex" gap={1.5} alignItems="flex-start">
                <IconButton size="small" onClick={() => setShowSettings(false)}>
                  <ArrowBackRoundedIcon fontSize="small" />
                </IconButton>
                <Typography variant="h5" fontWeight={600}>
                  Page Analytics Settings
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => onClose(true)}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ mt: 2.5 }}>
            <img
              src={googleAnalyticsIcon}
              alt="Google Analytics Icon"
              width="100px"
            />
            <Typography variant="body1" mb={3} mt={1.5}>
              You are currently connected to the following Google Account.
            </Typography>
            <ListItem disablePadding>
              <ListItemAvatar>
                <Avatar
                  src={data?.picture}
                  alt={`${data?.given_name} ${data?.family_name}`}
                />
              </ListItemAvatar>
              <ListItemText
                primary={`${data?.given_name} ${data?.family_name}`}
                secondary={data?.email}
              />
            </ListItem>
            <Box display="flex" gap={1} mt={3}>
              <Button
                onClick={initiate}
                variant="outlined"
                color="inherit"
                startIcon={<img src={googleIcon} width="20" height="20" />}
              >
                Change Google Account
              </Button>
              <Button
                onClick={() => {
                  setShowDisconnectConfirmation(true);
                }}
                variant="contained"
                color="error"
                startIcon={<PersonRemoveRoundedIcon />}
              >
                Disconnect Account
              </Button>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

const DisconnectConfirmationDialog = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box
          sx={{
            backgroundColor: "red.100",
            borderRadius: "100%",
            width: "40px",
            height: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PersonRemoveRoundedIcon color="error" />
        </Box>
        <Typography variant="h5" fontWeight={600} mb={1} mt={1.5}>
          Disconnect Google Analytics Account?
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Disconnecting will mean that you will not be able to view analytics
          for any content items in Zesty.
        </Typography>
      </DialogTitle>
      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          color="error"
          onClick={() => {
            setLoading(true);
            onConfirm();
          }}
        >
          Disconnect Account
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
