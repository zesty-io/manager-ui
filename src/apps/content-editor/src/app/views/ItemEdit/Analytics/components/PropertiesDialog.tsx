import React, { useState } from "react";
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
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../../shell/services/cloudFunctions";
import {
  useCreateInstanceSettingsMutation,
  useGetInstanceSettingsQuery,
  useUpdateInstanceSettingMutation,
} from "../../../../../../../../shell/services/instance";
import { NoSearchResults } from "../../../../../../../../shell/components/NoSearchResults";

type Props = {
  onClose: () => void;
};

export const PropertiesDialog = ({ onClose }: Props) => {
  const { data } = useGetAnalyticsPropertiesQuery();
  const { data: instanceSettings } = useGetInstanceSettingsQuery();
  const [createInstanceSetting] = useCreateInstanceSettingsMutation();
  const [updateInstanceSetting] = useUpdateInstanceSettingMutation();
  const property = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  );
  const [search, setSearch] = useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredData = data?.filter((property: any) =>
    property.displayName.toLowerCase().includes(search.toLowerCase())
  );

  const handlePropertySelection = (selectedProperty: any) => {
    if (property) {
      updateInstanceSetting({
        ...property,
        value: selectedProperty.name,
      });
      onClose();
    } else {
      createInstanceSetting({
        category: "analytics",
        key: "google_property_id",
        keyFriendly: "Google Property ID",
        value: selectedProperty.name,
        dataType: "text",
      });
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      sx={{
        my: "20px",
      }}
      PaperProps={{
        sx: {
          maxWidth: "640px",
          height: "100%",
          maxHeight: "min(100%, 1000px)",
          m: 0,
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 1 }}
        >
          <Box>
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
            <Typography variant="h5" sx={{ mt: 1.5 }}>
              Select a Google Analytics Property
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
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
          <IconButton size="small" onClick={() => onClose()}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
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
            <Typography variant="h6" fontWeight="600">
              {filteredData?.length} Properties
            </Typography>
            <List
              disablePadding
              sx={{
                border: "1px solid",
                borderColor: "border",
                borderRadius: "8px",
                mt: 2,
              }}
            >
              {filteredData?.map((property: any, index: number) => (
                <ListItemButton
                  key={property.name}
                  divider={index === filteredData?.length - 1 ? false : true}
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
    </Dialog>
  );
};
