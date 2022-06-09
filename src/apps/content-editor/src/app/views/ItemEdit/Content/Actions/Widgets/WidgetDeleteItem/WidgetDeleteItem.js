import { memo, useState, Fragment } from "react";
import cx from "classnames";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import CircularProgress from "@mui/material/CircularProgress";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { deleteItem } from "shell/store/content";
import { closeTab } from "shell/store/ui";

export const WidgetDeleteItem = memo(function WidgetDeleteItem(props) {
  const history = useHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Fragment>
      <Accordion sx={{ m: "16px !important" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <DeleteIcon fontSize="small" /> Delete Content
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Delete this content? Removing it from all locations throughout your
            site and making it unavailable to API requests.
          </Typography>

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
        </AccordionDetails>
      </Accordion>

      <ConfirmDialog
        isOpen={confirmOpen}
        prompt={`Are you sure you want to delete the item:
          ${props.metaTitle}`}
      >
        <Button
          variant="contained"
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
                  props.dispatch(closeTab(history.location.pathname));
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
    </Fragment>
  );
});
