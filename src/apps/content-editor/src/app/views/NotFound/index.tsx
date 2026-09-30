import { Link, useHistory } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import {
  Container,
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotFound = () => {
  const { t } = useTranslation();
  const history = useHistory();
  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "71px",
        p: 4,
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        rowGap={1}
        flexGrow={1}
        maxWidth={540}
      >
        <Typography variant="h3" fontWeight="700" color="text.primary">
          {t("content.notFoundDeletedHeading")}
        </Typography>
        <Typography variant="body2" fontWeight="400" color="text.secondary">
          <Trans
            i18nKey="content.notFoundContactBodyRich"
            components={{
              supportLink: (
                <Typography
                  component="a"
                  variant="body2"
                  fontWeight="400"
                  color="info.main"
                  href="mailto:support@zesty.io"
                />
              ),
            }}
          />
          {":"}
        </Typography>

        <Typography
          component="a"
          variant="body2"
          fontWeight="400"
          color="info.main"
          href={window.location.href}
          target="_blank"
          mt={2}
        >
          {window.location.href}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          onClick={() => {
            history.goBack();
          }}
        >
          {t("common.goBack")}
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          flexGrow: 0,
          flexShrink: 0,
          height: 320,
          width: 320,
        }}
      >
        <CardMedia
          loading="lazy"
          component="img"
          height="100%"
          image="/images/notFoundTransparent.png"
          alt={t("content.notFoundImageAlt")}
        />
      </Card>
    </Container>
  );
};

export default NotFound;
