import styles from "./NotFound.less";

export default function NotFound(props) {
  return (
    <section className={styles.NotFound}>
      <h1 className={styles.display}>{props.message}</h1>
    </section>
  );
}
