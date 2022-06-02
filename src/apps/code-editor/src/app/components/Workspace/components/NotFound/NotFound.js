import { connect } from "react-redux";

import styles from "./NotFound.less";
export default connect((state) => state)(function NotFound(props) {
  return (
    <div className={styles.NotFound}>
      <h1 className={styles.display}>View Not Found</h1>
    </div>
  );
});
