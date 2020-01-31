import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { CollapsibleCard } from "@zesty-io/core/CollapsibleCard";

import { notify } from "shell/store/notifications";
import { unpublishItem } from "shell/store/content";

import styles from "./Unpublish.less";
export const Unpublish = React.memo(function Unpublish(props) {
  const isPublished = props.publishing && props.publishing.isPublished;

  const [loading, setLoading] = useState(false);

  const handleUnpublish = () => {
    const date = new Date();

    //  GMT time
    let now = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);

    const year = now.getFullYear();
    const month = `0${now.getMonth() + 1}`.slice(-2);
    const day = `0${now.getDate()}`.slice(-2);

    const hours = `0${now.getHours()}`.slice(-2);
    const minutes = `0${now.getMinutes()}`.slice(-2);
    const seconds = `0${now.getSeconds()}`.slice(-2);
    const take_offline_at = `${[year, month, day].join("-")} ${[
      hours,
      minutes,
      seconds
    ].join(":")}`;

    // moment.now("Y-M-D H:M:S");

    setLoading(true);

    props
      .dispatch(
        unpublishItem(
          props.modelZUID,
          props.itemZUID,
          props.publishing.ZUID,
          take_offline_at
        )
      )
      .then(res => {
        setLoading(false);
        if (res.status === 400) {
          notify({
            message: `Failure unpublishing item: ${res.message}`,
            kind: "error"
          });
        } else {
          notify({
            message: "Successfully sent unpublish request",
            kind: "save"
          });
        }
      })
      .catch(() => {
        setLoading(false);
        notify({
          message: "Error sending unpublish request",
          kind: "error"
        });
      });
  };

  return (
    <CollapsibleCard
      className={styles.Unpublish}
      header={
        <React.Fragment>
          <FontAwesomeIcon icon={faUnlink} />
          &nbsp;Unpublish
        </React.Fragment>
      }
      footer={
        <Button
          id="UnpublishItemButton"
          onClick={handleUnpublish}
          disabled={loading || !isPublished}
        >
          {loading ? (
            <FontAwesomeIcon icon={faSpinner} />
          ) : (
            <FontAwesomeIcon icon={faUnlink} />
          )}
          Unpublish
        </Button>
      }
    >
      <p>
        By unpublishing this content it will no longer be served if the URL is
        requested. The URL will return a 404 not found response.
      </p>
    </CollapsibleCard>
  );
});
