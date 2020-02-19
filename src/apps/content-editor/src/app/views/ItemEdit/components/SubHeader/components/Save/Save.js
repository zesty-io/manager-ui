import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faSave } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";

import styles from "./Save.less";
export default React.memo(function Save(props) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  return (
    <Button kind="save" disabled={loading} onClick={props.onSave}>
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} />
      ) : (
        <FontAwesomeIcon icon={faSave} />
      )}
      Save New Version&nbsp;
      <small>({props.OS === "win" ? "CTRL" : "CMD"} + S)</small>
    </Button>
  );
});
