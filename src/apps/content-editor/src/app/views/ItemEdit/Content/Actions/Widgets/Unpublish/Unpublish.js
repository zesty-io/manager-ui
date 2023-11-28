import { memo, useState } from "react";

import LoadingButton from "@mui/lab/LoadingButton";
import Typography from "@mui/material/Typography";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import { unpublish } from "shell/store/content";
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          By unpublishing this content it will no longer be served if the URL is
          requested. The URL will return a 404 not found response.
        </Typography>
        <LoadingButton
          disableElevation
          variant="contained"
          id="UnpublishItemButton"
          onClick={handleUnpublish}
          disabled={!isPublished}
          loading={loading}
          loadingPosition="start"
          startIcon={<ManageAccountsRoundedIcon />}
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
          Manage Publish State
        </LoadingButton>
      </CardContent>
    </Card>
  );
});
