import React, { useState } from "react";
import { Box, Button, Link, Skeleton } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useGetAnalyticsPropertiesQuery } from "../../../../../../../shell/services/cloudFunctions";
import { useGetInstanceSettingsQuery } from "../../../../../../../shell/services/instance";
import { PropertiesDialog } from "./PropertiesDialog";

type Props = {
  showSkeleton?: boolean;
  path?: string;
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
        <Link
          href={`${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${path}`}
          target="__blank"
          sx={{
            maxWidth: "440px",
            direction: "rtl",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
          }}
        >
          {`${propertyData?.dataStreams?.[0]?.webStreamData?.defaultUri}${
            path?.slice(0, -1) || ""
          }`}
        </Link>

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
