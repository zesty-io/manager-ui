import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Modal,
  ModalHeader,
  ModalContent,
} from "shell/components/legacy/Modal";
import { WithLoader } from "shell/components/legacy/WithLoader";

import api from "../../api";

import styles from "./Meta.less";
export function Meta(props) {
  const { t } = useTranslation();
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
        <p>{t("activePreview.viewingMetaData")}</p>
        {/* <Url href={{CONFIG}/content/${props.item.meta.contentModelZUID}/${props.item.meta.ZUID}}>Edit Item</Url> */}
      </ModalHeader>
      <ModalContent>
        <WithLoader
          condition={!loading}
          message={t("activePreview.loadingRelatedItem")}
        >
          <ul className={styles.Item}>
            <h2>{t("activePreview.meta")}</h2>
            <ul>
              {Object.keys(item.meta).map((prop, index) => (
                <li key={index}>
                  {prop}: {item.meta[prop]}
                </li>
              ))}
            </ul>
            <h2>{t("activePreview.web")}</h2>
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
