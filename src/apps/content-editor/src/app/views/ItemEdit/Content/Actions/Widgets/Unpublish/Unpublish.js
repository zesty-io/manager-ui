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
    <Box sx={{ m: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <UnpublishedIcon fontSize="small" /> Unpublish
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
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
            startIcon={<LinkOffIcon />}
          >
            Unpublish
          </LoadingButton>
        </AccordionActions>
      </Accordion>
    </Box>
  );
});
