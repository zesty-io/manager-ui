import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe, faKey, faPlug } from "@fortawesome/free-solid-svg-icons";
import { useDomain } from "shell/hooks/use-domain";

import { Button } from "@zesty-io/core/Button";
import GaAuthenticate from "./GaAuthenticate";

export default function GoogleAuthOverlayDomain(props) {
  const domain = useDomain();

  return (
    <div>
      {domain ? (
        <React.Fragment>
          {props.gaLegacyAuth ? (
            <React.Fragment>
              <h2>{props.authTitles}</h2>
              <p>{props.authDescriptions}</p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h2>{props.authNotTitles}</h2>
              <p>{props.authNotDescriptions}</p>
            </React.Fragment>
          )}

          <GaAuthenticate onClick={props.createAnalyticsPopup} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <h2>{props.authTitlesNoDomain}</h2>
          <p>{props.authDescriptionsNoDomain}</p>
          <div className={styles.buttonHolder}>
            <Button
              kind="secondary"
              onClick={() => {
                window.location = `${CONFIG.URL_ACCOUNTS}/instances/${props.instanceZUID}/launch`;
              }}
            >
              <FontAwesomeIcon icon={faGlobe} />
              Click here to Setup Your Domain
            </Button>
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
