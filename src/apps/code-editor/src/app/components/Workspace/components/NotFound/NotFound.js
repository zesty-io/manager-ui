import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./NotFound.less";
export default connect((state) => state)(function NotFound(props) {
  const { t } = useTranslation();
  return (
    <div className={styles.NotFound}>
      <h1 className={styles.display}>{t("code.viewNotFound")}</h1>
    </div>
  );
});
