import { Fragment } from "react";

import { usePermission } from "shell/hooks/use-permissions";

import Button from "@mui/material/Button";

import KeyIcon from "@mui/icons-material/Key";

import styles from "./GoogleAuthOverlay.less";

export default function GaAuthenticate(props) {
  const canAuthenticate = usePermission("CODE");

  return (
    <Fragment>
      {canAuthenticate && (
        <div className={styles.buttonHolder}>
          <Button
            variant="contained"
            color="success"
            onClick={props.onClick}
            startIcon={<KeyIcon />}
          >
            Click here to Authenticate With Google
          </Button>
        </div>
      )}
    </Fragment>
  );
}
