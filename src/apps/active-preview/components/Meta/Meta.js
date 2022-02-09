import { useEffect, useState } from "react";

import { Modal, ModalHeader, ModalContent } from "@zesty-io/core/Modal";
import { WithLoader } from "@zesty-io/core/WithLoader";

import api from "../../api";

import styles from "./Meta.less";
export function Meta(props) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState({
    meta: {},
    web: {},
  });

  useEffect(() => {
    const URL = `${CONFIG.API_INSTANCE_PROTOCOL}${props.instanceZUID}${CONFIG.API_INSTANCE}`;

    setLoading(true);
    api(`${URL}/search/items?q=${props.route}&limit=1`).then((json) => {
      const item = json.data.find(
        (item) => item.web && item.web.path === props.route
      );
      if (item) {
        setItem(item);
      }
      setLoading(false);
    });
  }, [props.route]);

  return (
    <Modal open={props.open} className={styles.Meta}>
      <ModalHeader className={styles.ModalHeader}>
        <h1 className={styles.title}>{props.route}</h1>
        <p>Viewing meta data for the item at this route</p>
        {/* <Url href={{CONFIG}/content/${props.item.meta.contentModelZUID}/${props.item.meta.ZUID}}>Edit Item</Url> */}
      </ModalHeader>
      <ModalContent>
        <WithLoader condition={!loading} message="Loading related item">
          <ul className={styles.Item}>
            <h2>Meta</h2>
            <ul>
              {Object.keys(item.meta).map((prop, index) => (
                <li key={index}>
                  {prop}: {item.meta[prop]}
                </li>
              ))}
            </ul>
            <h2>Web</h2>
            <ul>
              {Object.keys(item.web).map((prop, index) => (
                <li key={index}>
                  {prop}: {item.web[prop]}
                </li>
              ))}
            </ul>
          </ul>
        </WithLoader>
      </ModalContent>
    </Modal>
  );
}
