import React, { useState, Fragment } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { CollapsibleCard } from "@zesty-io/core/CollapsibleCard";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { notify } from "shell/store/notifications";
import { deleteItem } from "shell/store/content";

export const WidgetDeleteItem = React.memo(function WidgetDeleteItem(props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Fragment>
      <CollapsibleCard
        id="WidgetDeleteItem"
        className="pageDetailWidget"
        header={
          <span>
            <FontAwesomeIcon icon={faTrashAlt} />
            &nbsp;Delete Content
          </span>
        }
        footer={
          <Button
            kind="warn"
            id="DeleteItemButton"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            {deleting ? (
              <FontAwesomeIcon icon={faSpinner} />
            ) : (
              <FontAwesomeIcon icon={faTrashAlt} />
            )}
            Delete
          </Button>
        }
      >
        <p>
          Delete this content? Removing it from all locations throughout your
          site and making it unavailable to API requests.
        </p>
      </CollapsibleCard>
      <ConfirmDialog
        isOpen={confirmOpen}
        prompt={`Are you sure you want to delete the item:
          ${props.metaTitle}`}
      >
        <Button
          id="deleteConfirmButton"
          kind="warn"
          onClick={() => {
            setConfirmOpen(false);
            setDeleting(true);

            props
              .dispatch(deleteItem(props.modelZUID, props.itemZUID))
              .then(res => {
                if (res.status === 200) {
                  notify({
                    message: `Successfully deleted ${props.metaTitle}`,
                    kind: "save"
                  });
                  if (
                    props.modelType === "pageset" ||
                    props.modelType === "dataset"
                  ) {
                    window.location.hash = `/content/${props.modelZUID}`;
                  } else {
                    window.location.hash = "/content/home";
                  }
                }

                setDeleting(false);
              });
          }}
        >
          Delete
        </Button>
        <Button
          id="deleteCancelButton"
          kind="cancel"
          onClick={() => setConfirmOpen(false)}
        >
          Cancel
        </Button>
      </ConfirmDialog>
    </Fragment>
  );
});
