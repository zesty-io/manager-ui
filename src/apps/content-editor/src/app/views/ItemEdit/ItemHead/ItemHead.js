import React from "react";

import { Head } from "shell/components/Head";
import { Header } from "../components/Header";

import styles from "./ItemHead.less";
export default function ItemHead(props) {
  return (
    <div className={styles.ItemHead}>
      <Header
        instance={props.instance}
        modelZUID={props.modelZUID}
        model={props.model}
        itemZUID={props.itemZUID}
        item={props.item}
      />
      <Head resourceZUID={props.itemZUID} />
    </div>
  );
}
