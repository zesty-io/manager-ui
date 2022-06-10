import { memo, Fragment, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import UnpublishedIcon from "@mui/icons-material/Unpublished";

import { unpublish } from "shell/store/content";

export const Unpublish = memo(function Unpublish(props) {
  const isPublished = props.publishing && props.publishing.isPublished;

  const [loading, setLoading] = useState(false);

  const handleUnpublish = () => {
    setLoading(true);
    props
      .dispatch(
        unpublish(props.modelZUID, props.itemZUID, props.publishing.ZUID)
      )
      .finally(() => {
        setLoading(false);
      });
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

          <Button
            variant="contained"
            id="UnpublishItemButton"
            onClick={handleUnpublish}
            disabled={loading || !isPublished}
            startIcon={
              loading ? <CircularProgress size="20px" /> : <LinkOffIcon />
            }
            sx={{ alignSelf: "flex-start" }}
          >
            Unpublish
          </Button>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
});
