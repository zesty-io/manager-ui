import { Head } from "shell/components/Head";

import styles from "./ItemHead.less";
export default function ItemHead(props) {
  return (
    <div className={styles.ItemHead}>
      <Head resourceZUID={props.itemZUID} />
    </div>
  );
}
