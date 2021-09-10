import { memo, useState, Fragment } from "react";
import cx from "classnames";
import { useHistory } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBan,
  faSpinner,
  faTrash,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import {
  CollapsibleCard,
  CardContent,
  CardFooter,
} from "@zesty-io/core/CollapsibleCard";
import { ConfirmDialog } from "@zesty-io/core/ConfirmDialog";

import { deleteItem } from "shell/store/content";
import { closeTab } from "shell/store/ui";

export const WidgetDeleteItem = memo(function WidgetDeleteItem(props) {
  const history = useHistory();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <Fragment>
      <CollapsibleCard
        id="WidgetDeleteItem"
        className={cx("pageDetailWidget", "Delete")}
        header={
          <span>
            <FontAwesomeIcon icon={faTrashAlt} />
            &nbsp;Delete Content
          </span>
        }
      >
        <CardContent>
          <p>
            Delete this content? Removing it from all locations throughout your
            site and making it unavailable to API requests.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            type="warn"
            id="DeleteItemButton"
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
          >
            {deleting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faTrashAlt} />
            )}
            Delete
          </Button>
        </CardFooter>
      </CollapsibleCard>
      <ConfirmDialog
        isOpen={confirmOpen}
        prompt={`Are you sure you want to delete the item:
          ${props.metaTitle}`}
      >
        <Button
          id="deleteConfirmButton"
          type="warn"
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
        >
          <FontAwesomeIcon icon={faTrash} />
          Delete
        </Button>
        <Button
          id="deleteCancelButton"
          type="cancel"
          onClick={() => setConfirmOpen(false)}
        >
          <FontAwesomeIcon icon={faBan} />
          Cancel
        </Button>
      </ConfirmDialog>
    </Fragment>
  );
});
