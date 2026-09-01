import { alpha } from "@mui/material/styles";
import { theme } from "@zesty-io/material";
import { memo, useState } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { useHistory, useLocation } from "react-router";

export const Unpublish = memo(function Unpublish(props) {
  const isPublished = props.publishing && props.publishing.isPublished;

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const history = useHistory();

  const handleUnpublish = () => {
    // setLoading(true);
    // props
    //   .dispatch(
    //     unpublish(props.modelZUID, props.itemZUID, props.publishing.ZUID)
    //   )
    //   .finally(() => {
    //     setLoading(false);
    //   });
    history.push(`${location.pathname}/publishings`);
  };

  return (
    <Card sx={{ mb: 3, backgroundColor: "transparent" }} elevation={0}>
      <CardHeader
        sx={{
          p: 0,
          backgroundColor: "transparent",
          fontSize: "16px",
          color: alpha(theme.palette.text.primary, 0.4),
          borderBottom: 1,
          borderColor: "grey.200",
        }}
        titleTypographyProps={{
          sx: {
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "32px",
            color: "text.primary",
          },
        }}
        title="UNPUBLISH"
      ></CardHeader>
      <CardContent
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
            <Stack gap={1.25} mb={2.75}>
              <Skeleton variant="rounded" width="100%" height={20} />
              <Skeleton variant="rounded" width={259} height={20} />
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
              By unpublishing this content it will no longer be served if the
              URL is requested. The URL will return a 404 not found response.
            </Typography>
            <Button
              disableElevation
              variant="contained"
              id="UnpublishItemButton"
              onClick={handleUnpublish}
              disabled={!isPublished}
              loading={loading}
              loadingPosition="start"
              startIcon={<ManageAccountsRoundedIcon />}
              sx={{
                backgroundColor: "grey.100",
                color: "text.secondary",
                mt: 1.5,

                "&:hover": {
                  backgroundColor: "grey.200",
                  color: "text.secondary",
                },
              }}
            >
              Manage Publish State
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
});
