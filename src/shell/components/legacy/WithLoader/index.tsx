import React from "react";
import styles from "./WithLoader.less";

import { Loader } from "../Loader";

type WithLoaderProps = {
  condition: boolean;
  height?: string;
  width?: string;
  message?: string;
  children: React.ReactNode;
};
export const WithLoader = (props: WithLoaderProps) => {
  return props.condition ? (
    props.children
  ) : (
    <section
      className={styles.Loading}
      style={{ height: props.height, width: props.width }}
    >
      <h3 className={styles.Display}>{props.message}</h3>
      <Loader />
    </section>
  );
};
