import { memo, useState } from "react";

import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import UnpublishedIcon from "@mui/icons-material/Unpublished";

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
    <Box sx={{ mx: 2, mb: 3, backgroundColor: "transparent" }}>
      <Accordion elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            backgroundColor: "transparent",
            p: 0,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "16px",
              color: "#10182866",
              ".MuiSvgIcon-root": {
                mr: 1,
              },
            }}
          >
            <UnpublishedIcon fontSize="inherit" color="inherit" />
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#101828",
              }}
            >
              Unpublish
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: "16px", p: 0 }}
        >
          <Typography>
            By unpublishing this content it will no longer be served if the URL
            is requested. The URL will return a 404 not found response.
          </Typography>
        </AccordionDetails>
        <AccordionActions>
          <LoadingButton
            variant="contained"
            id="UnpublishItemButton"
            onClick={handleUnpublish}
            disabled={!isPublished}
            loading={loading}
            loadingPosition="start"
            startIcon={<LinkOffIcon />}
          >
            Unpublish
          </LoadingButton>
        </AccordionActions>
      </Accordion>
    </Box>
  );
});
