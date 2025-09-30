import styles from "./Loader.less";

export const Loader = () => {
  return (
    <div className={styles.loader}>
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
      <span className={styles.bar} />
    </div>
  );
};
