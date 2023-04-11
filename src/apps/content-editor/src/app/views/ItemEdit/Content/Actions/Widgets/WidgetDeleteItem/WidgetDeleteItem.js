import { memo, useState } from "react";

import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { ConfirmDialog } from "@zesty-io/material";

import { deleteItem } from "shell/store/content";
import { unpinTab } from "shell/store/ui";

export const WidgetDeleteItem = memo(function WidgetDeleteItem(props) {
  const history = useHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Box sx={{ m: 2 }} data-cy="WidgetDeleteAccordion">
      <Accordion elevation={0}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <DeleteIcon fontSize="small" /> Delete Content
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography>
            Delete this content? Removing it from all locations throughout your
            site and making it unavailable to API requests.
          </Typography>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            color="error"
            type="warn"
            id="DeleteItemButton"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            startIcon={
              deleting ? <CircularProgress size="20px" /> : <DeleteIcon />
            }
          >
            Delete
          </Button>
        </AccordionActions>
      </Accordion>

      <ConfirmDialog
        open={confirmOpen}
        title={`Are you sure you want to delete the item:
          ${props.metaTitle}`}
      >
        <Button
          variant="outlined"
          id="deleteCancelButton"
          onClick={() => setConfirmOpen(false)}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color="error"
          id="deleteConfirmButton"
          onClick={() => {
            setConfirmOpen(false);
            setDeleting(true);
            props
              .dispatch(deleteItem(props.modelZUID, props.itemZUID))
              .then((res) => {
                if (res.status === 200) {
                  const { pathname, search } = history.location;
                  props.dispatch(unpinTab({ pathname, search }));
                  history.push("/content/" + props.modelZUID);
                } else {
                  // if delete fails, component is still mounted, so we can set state
                  setDeleting(false);
                }
              });
          }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </ConfirmDialog>
    </Box>
  );
});
