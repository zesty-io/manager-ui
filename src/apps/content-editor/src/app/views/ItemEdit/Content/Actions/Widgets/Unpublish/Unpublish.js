import { memo, Fragment, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import {
  CollapsibleCard,
  CardContent,
  CardFooter,
} from "@zesty-io/core/CollapsibleCard";

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
    <CollapsibleCard
      className={"Unpublish"}
      header={
        <Fragment>
          <FontAwesomeIcon icon={faUnlink} />
          &nbsp;Unpublish
        </Fragment>
      }
    >
      <CardContent>
        <p>
          By unpublishing this content it will no longer be served if the URL is
          requested. The URL will return a 404 not found response.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          id="UnpublishItemButton"
          onClick={handleUnpublish}
          disabled={loading || !isPublished}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <FontAwesomeIcon icon={faUnlink} />
          )}
          Unpublish
        </Button>
      </CardFooter>
    </CollapsibleCard>
  );
});
