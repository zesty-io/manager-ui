import { useState } from "react";
import { useHistory } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { ConfirmDialog } from "@zesty-io/material";

import { notify } from "shell/store/notifications";
import { deleteModel } from "shell/store/models";

export default function Delete(props) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  return (
    <Box sx={{ m: 2 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ display: "flex", alignItems: "center" }}>
            {" "}
            <DeleteIcon fontSize="small" /> Delete Model
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <Typography>
            Deleting a model is a permanent action that can not be undone. By
            doing so all content items created from this model will be deleted
            along with it. Ensure you want to do this action.
          </Typography>
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => setIsOpen(true)}
            startIcon={<DeleteIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Delete Model
          </Button>
        </AccordionActions>
      </Accordion>
      <ConfirmDialog
        open={isOpen}
        title={`Are you sure you want to delete the model: ${props.model.label}?`}
      >
        <Button
          variant="outlined"
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
    </Box>
  );
}
