import { Fragment, useState } from "react";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import DoDisturbAltIcon from "@mui/icons-material/DoDisturbAlt";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faBan } from "@fortawesome/free-solid-svg-icons";
import {
  CollapsibleCard,
  CardContent,
  CardFooter,
} from "@zesty-io/core/CollapsibleCard";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { notify } from "shell/store/notifications";
import { deleteModel } from "shell/store/models";

import styles from "./Delete.less";

export default function Delete(props) {
  return (
    <CollapsibleCard className={styles.Delete} header={Header(props)}>
      <CardContent>
        <p>
          Deleting a model is a permanent action that can not be undone. By
          doing so all content items created from this model will be deleted
          along with it. Ensure you want to do this action.
        </p>
      </CardContent>
      <Footer {...props} />
    </CollapsibleCard>
  );
}

function Header() {
  return (
    <Fragment>
      <FontAwesomeIcon icon={faTrash} />
      &nbsp;Delete Model
    </Fragment>
  );
}

function Footer(props) {
  const [isOpen, setIsOpen] = useState(false);
  const history = useHistory();

  return (
    <Fragment>
      <CardFooter>
        <Button
          variant="contained"
          color="error"
          onClick={() => setIsOpen(true)}
          startIcon={<DeleteIcon />}
        >
          Delete Model
        </Button>
      </CardFooter>

      <ConfirmDialog
        isOpen={isOpen}
        prompt={`Are you sure you want to delete the model: ${props.model.label}?`}
      >
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
        <Button
          variant="contained"
          id="deleteCancelButton"
          onClick={() => setIsOpen(false)}
          startIcon={<DoDisturbAltIcon />}
        >
          Cancel
        </Button>
      </ConfirmDialog>
    </Fragment>
  );
}
