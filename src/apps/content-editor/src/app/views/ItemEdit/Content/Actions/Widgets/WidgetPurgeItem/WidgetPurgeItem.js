import { memo, useState } from "react";

import SyncIcon from "@mui/icons-material/Sync";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { notify } from "shell/store/notifications";
import { request } from "utility/request";
import { useTranslation } from "react-i18next";

export const WidgetPurgeItem = memo(function WidgetPurgeItem(props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  return (
    <Card
      id="WidgetDeleteItem"
      className="pageDetailWidget"
      sx={{ mb: 3, backgroundColor: "transparent" }}
      elevation={0}
    >
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: "#10182866",
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "#101828",
          },
        }}
        title={t("content.itemEditCdnTitle")}
      ></CardHeader>
      <CardContent
        className="setting-field"
        sx={{
          p: 0,
          pt: 2,
          "&:last-child": {
            pb: 0,
          },
        }}
      >
        {props.isLoadingItem ? (
          <Box>
            <Stack gap={1.25} mb={4}>
              <Skeleton variant="rounded" width="100%" height={20} />
              <Skeleton variant="rounded" width={259} height={20} />
              <Skeleton variant="rounded" width={200} height={20} />
            </Stack>
            <Skeleton variant="rounded" width={137} height={32} />
          </Box>
        ) : (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: "14px",
                lineHeight: "20px",
                maxWidth: "595px",
              }}
            >
              {t("content.itemEditCdnDescription")}
            </Typography>
            <Button
              variant="contained"
              id="RefreshCache"
              onClick={() => {
                setLoading(true);

                return request(
                  `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/fastlyPurge?zuid=${props.itemZUID}&instance=${props.instanceZUID}`
                )
                  .then(() => {
                    setLoading(false);
                    props.dispatch(
                      notify({
                        message: t("content.itemEditCdnPurgeSuccess"),
                        kind: "save",
                      })
                    );
                  })
                  .catch(() => {
                    setLoading(false);
                    props.dispatch(
                      notify({
                        message: t("content.itemEditCdnPurgeError"),
                        kind: "warn",
                      })
                    );
                  });
              }}
              loading={loading}
              loadingPosition="start"
              startIcon={<SyncIcon />}
              disableElevation
              sx={{
                backgroundColor: "#F2F4F7",
                color: "text.secondary",
                mt: 1.5,

                "&:hover": {
                  backgroundColor: "#E4E7EC",
                  color: "text.secondary",
                },
              }}
            >
              {loading
                ? t("content.itemEditRefreshingCachedItem")
                : t("content.itemEditRefreshCachedItem")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
});
