import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@zesty-io/core/Button";

import styles from "./Start.less";
export function Start(props) {
  return (
    <div className={styles.Start}>
      <ol className={styles.display}>
        <li>
          Begin by searching for content you want to include in this release
        </li>
        <li>Select an item from the search list to add it to this release</li>
        <li>
          Press the "Publish All" button to publish all the items listed in the
          release
        </li>
      </ol>

      <Button className={styles.Create} kind="save" size="large">
        <FontAwesomeIcon icon={faPlus} />
        Create Release
      </Button>
    </div>
  );
}
