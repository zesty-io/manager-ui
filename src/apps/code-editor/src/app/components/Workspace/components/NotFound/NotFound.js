import { connect } from "react-redux";
// import cx from "classnames";

// import { notify } from "shell/store/notifications";
// import { Button } from "@zesty-io/core/Button";

import styles from "./NotFound.less";
export default connect((state) => state)(function NotFound(props) {
  return (
    <div className={styles.NotFound}>
      <h1 className={styles.display}>View Not Found</h1>
    </div>
  );
});
