import { Box, Button, Card, CardMedia, Link, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";

const InvalidUrl = () => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "stretch",
        p: 15,
        bgcolor: "grey.50",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            width: "540px",
            rowGap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              rowGap: 2,
            }}
          >
            <Typography variant="h3" color="text.primary" fontWeight={700}>
              {t("shell.invalidUrlHeading")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("shell.invalidUrlBody")}
              <Link
                title={t("common.support")}
                href="mailto:support@zesty.io"
                color="secondary"
                underline="none"
              >{` support@zesty.io.`}</Link>
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <Button
              startIcon={<ArrowBackIcon />}
              variant="outlined"
              color="primary"
              onClick={() => history.goBack()}
            >
              {t("common.goBack")}
            </Button>
          </Box>
        </Box>
        <Card
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "320px",
            height: "320px",
            bgcolor: "transparent",
          }}
        >
          <CardMedia
            component="img"
            height="100%"
            width="100%"
            image="/images/notFoundTransparent.png"
            alt={t("shell.accessDeniedImageAlt")}
          />
        </Card>
      </Box>
    </Box>
  );
};

export default InvalidUrl;
