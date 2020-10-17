import React from "react";
import styles from "./NotFound.less";

export default function NotFound(props) {
  return (
    <section className={styles.NotFound}>
      <h1 className={styles.Display}>{props.message}</h1>
    </section>
  );
}
