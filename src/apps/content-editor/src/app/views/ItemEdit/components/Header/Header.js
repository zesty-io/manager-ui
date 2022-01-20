import React, { Fragment } from "react";
import cx from "classnames";

import { DuoModeToggle } from "./DuoModeToggle";
import { LanguageSelector } from "./LanguageSelector";

import ItemNavigation from "./ItemNavigation";

import styles from "./Header.less";
export function Header(props) {
  return (
    <header className={styles.Header}>
      <div className={cx(styles.Split)}>
        <div className={styles.Left}>
          <ItemNavigation
            modelZUID={props.modelZUID}
            itemZUID={props.itemZUID}
            item={props.item}
          />
        </div>
        <div className={styles.Right}>
          <div className={styles.Actions}>
            <DuoModeToggle item={props.item} />
            <LanguageSelector
              className={styles.I18N}
              itemZUID={props.itemZUID}
            />
            {props.children}
          </div>
        </div>
      </div>
    </header>
  );
}
