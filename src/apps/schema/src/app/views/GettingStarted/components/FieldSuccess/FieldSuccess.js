import cx from "classnames";

import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { AppLink } from "@zesty-io/core/AppLink";

import styles from "./FieldSuccess.less";
export function FieldSuccess(props) {
  return (
    <>
      <h2 className={cx(styles.display, styles.Title)}>
        You've successfully added a field to {props.modelLabel}
      </h2>

      <div className={styles.SuccessButtons}>
        <Button
          variant="contained"
          color="secondary"
          onClick={props.handleAddField}
          startIcon={<ChevronLeftIcon />}
        >
          Add another field
        </Button>

        <AppLink
          to={`/content/${props.modelZUID}/new`}
          onClick={props.goToContent}
        >
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            I want to add content
          </Button>
        </AppLink>
      </div>
    </>
  );
}
