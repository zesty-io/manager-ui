import cx from "classnames";
import styles from "./Widget.less";

export function Widget(props) {
  return (
    <aside className={cx(styles.Widget, props.className)}>
      {props.children}
    </aside>
  );
}

export function WidgetHeader(props) {
  return (
    <header className={cx(styles.WidgetHeader, props.className)}>
      {props.children}
    </header>
  );
}

export function WidgetContent(props) {
  return (
    <main className={cx(styles.WidgetContent, props.className)}>
      {props.children}
    </main>
  );
}
