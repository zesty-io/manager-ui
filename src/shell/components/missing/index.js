import React from "react";
import { Button } from "@zesty-io/core/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useHistory } from "react-router-dom";

export default function Missing(props) {
  let history = useHistory();
  return (
    <section>
      <h1 style={{ textAlign: "center", fontSize: "38px", marginTop: "100px" }}>
        {props.missingText
          ? props.missingText
          : "This URL doesn't seem to have have anything here."}
      </h1>
      {props.buttonText && props.buttonPath && props.buttonIcon && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "8px"
          }}
        >
          <Button
            kind="secondary"
            onClick={() => history.push(props.buttonPath)}
            type="save"
          >
            <FontAwesomeIcon icon={props.buttonIcon} />
            &nbsp;
            {props.buttonText}
          </Button>
        </div>
      )}
    </section>
  );
}
