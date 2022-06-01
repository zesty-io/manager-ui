import { memo, Fragment, useState } from "react";

import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import LinkOffIcon from "@mui/icons-material/LinkOff";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlink } from "@fortawesome/free-solid-svg-icons";

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
          variant="contained"
          id="UnpublishItemButton"
          onClick={handleUnpublish}
          disabled={loading || !isPublished}
          startIcon={
            loading ? <CircularProgress size="20px" /> : <LinkOffIcon />
          }
        >
          Unpublish
        </Button>
      </CardFooter>
    </CollapsibleCard>
  );
});
