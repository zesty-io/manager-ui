import React, { useState } from "react";
import { Box, Button, Link, Skeleton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../shell/services/analytics";
import { useGetInstanceSettingsQuery } from "../../../../../../../shell/services/instance";
import { PropertiesDialog } from "./PropertiesDialog";

type Props = {
  showSkeleton?: boolean;
  path?: string;
};

// A GA4 data stream's defaultUri is not guaranteed to be an absolute URL — it can
// come back as a bare host ("example.com") or a malformed value, both of which
// `new URL` rejects. Retrying with a scheme recovers the bare-host case; anything
// still unparseable has no usable host to link to.
const parseUri = (uri: string): URL | null => {
  for (const candidate of [uri, `https://${uri}`]) {
    try {
      return new URL(candidate);
    } catch {
      // try the next candidate
    }
  }

  return null;
};

const removeSubdomain = (hostname: string): string => {
  const parts = hostname.split(".");

  if (parts.length > 2) {
    parts.shift();
  }

  return parts.join(".");
};

export const AnalyticsPropertySelector = ({ showSkeleton, path }: Props) => {
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
  const { data: instanceSettings, isFetching: instanceSettingsFetching } =
    useGetInstanceSettingsQuery();
  const propertyId = instanceSettings?.find(
    (setting) => setting.key === "google_property_id"
  )?.value;
  const { data } = useGetAnalyticsPropertiesQuery();
  const propertyData = data?.properties?.find(
    (property: any) => property.name === propertyId
  );
  // A property can also hold app data streams, which carry no defaultUri
  const defaultUri: string | undefined = propertyData?.dataStreams?.find(
    (dataStream: any) => dataStream?.webStreamData?.defaultUri
  )?.webStreamData?.defaultUri;
  const parsedUri = defaultUri ? parseUri(defaultUri) : null;
  // Normalized so a bare host doesn't turn the href into a relative URL
  const baseUrl = parsedUri?.href.replace(/\/$/, "");

  if (!propertyData || showSkeleton) {
    return (
      <Box display="flex" gap={0.5} alignItems="center">
        <Skeleton variant="rectangular" width="177px" height="8px" />
        <Skeleton variant="rectangular" width="38px" height="22px" />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" gap={0.5} alignItems="center">
        {!!parsedUri && (
          <Link
            href={`${baseUrl}${path ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              maxWidth: "440px",
              direction: "rtl",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {`${removeSubdomain(parsedUri.hostname)}${
              path?.slice(0, -1) || ""
            }`}
          </Link>
        )}

        <Button
          data-cy="analytics-settings"
          onClick={() => setShowPropertiesDialog(true)}
          size="small"
          variant="outlined"
          color="inherit"
          sx={{
            height: "22px",
            width: "38px",
            minWidth: "unset",
            bgcolor: "background.paper",
          }}
        >
          <SettingsIcon color="action" sx={{ width: "18px", height: "18px" }} />
        </Button>
      </Box>
      {showPropertiesDialog && (
        <PropertiesDialog onClose={() => setShowPropertiesDialog(false)} />
      )}
    </>
  );
};
