import React, { useEffect, useRef, useState } from "react";

import { Modal, ModalHeader, ModalContent } from "@zesty-io/core/Modal";
import { WithLoader } from "@zesty-io/core/WithLoader";

import api from "../../api";

import styles from "./Meta.less";
export function Meta(props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    meta: {},
    web: {}
  });

  useEffect(() => {
    setLoading(true);

    api(
      `${CONFIG.API_INSTANCE_PROTOCOL}${props.instanceZUID}${CONFIG.API_INSTANCE}/search/items?q=${props.route}`
    ).then(json => {
      const item = json.data.find(
        item => item.web && item.web.path === props.route
      );
      if (item) {
        setItem(item);
        console.log("search item", item);
      }
      setLoading(false);
    });
  }, [props.route]);

  return (
    <Modal open={props.open} className={styles.Meta}>
      <ModalHeader>
        <h1 className={styles.title}>Currently Viewed Item</h1>
      </ModalHeader>
      <ModalContent>
        <WithLoader condition={!loading} message="Loading related item">
          <ul>
            <h2>Meta</h2>
            <ul>
              {Object.keys(item.meta).map((prop, index) => (
                <li key={index}>
                  {prop}: {item.meta[prop]}
                </li>
              ))}
            </ul>
          </ul>
        </WithLoader>
      </ModalContent>
    </Modal>
  );
}
