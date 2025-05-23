import { Link, useHistory } from "react-router-dom";
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
          This item has been deleted
        </Typography>
        <Typography variant="body2" fontWeight="400" color="text.secondary">
          If you believe you're missing a content item, please reach out to us
          at{" "}
          <Typography
            component="a"
            variant="body2"
            fontWeight="400"
            color="info.main"
            href="mailto:support@zesty.io"
          >
            support@zesty.io
          </Typography>{" "}
          and provide the following URL in your message:
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
          Go Back
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
          alt="Not Found"
        />
      </Card>
    </Container>
  );
};

export default NotFound;
