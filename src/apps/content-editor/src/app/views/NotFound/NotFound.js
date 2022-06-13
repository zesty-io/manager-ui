import Link from "@mui/material/Link";

import styles from "./NotFound.less";
export function NotFound(props) {
  return (
    <section className={styles.NotFound}>
      <main className={styles.wrap}>
        <h1 className={styles.display}>{props.message}</h1>
        {/* <h2>{props.message}</h2> */}
        <p className={styles.title}>
          If an item is missing please contact support and provide the url;
        </p>
        <p className={styles.title}>
          <Link
            underline="none"
            color="secondary"
            title={`Provide this URL: ${window.location.href} with your bug ticket`}
            href={window.location.href}
          >
            {window.location.href}
          </Link>
        </p>
      </main>
    </section>
  );
}
