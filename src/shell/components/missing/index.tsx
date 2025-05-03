import React from "react";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Container,
  Link,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useHistory, useLocation } from "react-router";

const Missing = () => {
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
              Invalid URL. Please check your URL and try again.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The URL you entered is invalid or does not exist. If you believe
              this is an error, contact us at
              <Link
                title="Support"
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
              Go Back
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
            alt="Page Not Found"
          />
        </Card>
      </Box>
    </Box>
  );
};

export default Missing;
