import { Fragment, useState } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { notify } from "shell/store/notifications";
import { deleteModel } from "shell/store/models";

export default function Delete(props) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  return (
    <Fragment>
      <Accordion sx={{ m: "16px !important" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
        >
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <DeleteIcon fontSize="small" /> Delete Model
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Deleting a model is a permanent action that can not be undone. By
            doing so all content items created from this model will be deleted
            along with it. Ensure you want to do this action.
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => setIsOpen(true)}
            startIcon={<DeleteIcon />}
          >
            Delete Model
          </Button>
        </AccordionDetails>
      </Accordion>
      <ConfirmDialog
        isOpen={isOpen}
        prompt={`Are you sure you want to delete the model: ${props.model.label}?`}
      >
        <Button
          variant="contained"
          id="deleteCancelButton"
          onClick={() => setIsOpen(false)}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          id="deleteConfirmButton"
          onClick={() => {
            props
              .dispatch(deleteModel(props.model.ZUID))
              .then(() => {
                history.push("/schema");
              })
              .catch((err) => {
                console.error(err);
                setIsOpen(false);
                props.dispatch(
                  notify({
                    kind: "warn",
                    message:
                      err.message ||
                      `Failed to delete model: ${props.model.label}`,
                  })
                );
              });
          }}
          startIcon={<DeleteIcon />}
        >
          Delete
        </Button>
      </ConfirmDialog>
    </Fragment>
  );
}
