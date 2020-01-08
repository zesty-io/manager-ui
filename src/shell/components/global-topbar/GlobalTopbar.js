import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestion,
  faBell,
  faComment
} from "@fortawesome/free-solid-svg-icons";

import cx from "classnames";

import styles from "./GlobalTopbar.less";
export default function GlobalTopbar(props) {
  return (
    <section className={styles.GlobalTopbar}>
      <h1 className={styles.InstanceName}>Instance Name</h1>
      <nav className={styles.quicklinks}>
        <ol>
          <li>
            <a href="">Page 1</a>
            <small></small>
          </li>
          <li>
            <a href="">Page 1</a>
          </li>
          <li>
            <a href="">Page 1</a>
          </li>
          <li>
            <a href="">Page 1</a>
          </li>
          <li>
            <a href="">Page 1</a>
          </li>
          <li>
            <a href="">Page 1</a>
          </li>
        </ol>
      </nav>
      <div className={styles.actions}>
        <button title="Help">
          <FontAwesomeIcon icon={faQuestion} />
        </button>
        <button title="Notice">
          <FontAwesomeIcon icon={faBell} />
        </button>
        <button title="chat">
          <FontAwesomeIcon icon={faComment} />
        </button>
      </div>
    </section>
  );
}
