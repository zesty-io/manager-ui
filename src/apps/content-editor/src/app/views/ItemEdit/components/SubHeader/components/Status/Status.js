import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import styles from "./Status.less";
export default React.memo(function Status(props) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  return <span>TODO STATUS</span>;
});
