import { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import { CopyButton } from "@zesty-io/core/CopyButton";
import { Url } from "@zesty-io/core/Url";

import styles from "./GlobalAccount.less";
export default connect((state) => {
  return {
    user: state.user,
    userRole: state.userRole,
  };
})(function GlobalAccount(props) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleGlobalClick = (evt) => {
      if (ref && ref.current.contains(evt.target)) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);

    return () => window.removeEventListener("click", handleGlobalClick);
  }, [ref]);

  return (
    <section className={styles.GlobalAccount} ref={ref}>
      <img
        className={styles.Avatar}
        alt={`${props.user.firstName} ${props.user.lastName} Avatar`}
        src={`https://www.gravatar.com/avatar/${props.user.emailHash}?d=mm&s=40`}
        height="30px"
        width="30px"
        onClick={(evt) => {
          // evt.stopPropagation();
          setOpen(!open);
        }}
      />

      <menu
        className={cx(styles.bodyText, styles.Menu, open ? null : styles.hide)}
      >
        <li>
          {props.user.firstName} {props.user.lastName}
        </li>
        <li className={styles.email}>{props.user.email} </li>

        <li className={styles.zuid}>
          ZUID:&nbsp;
          <CopyButton value={props.user.ZUID} />
        </li>

        <li className={styles.role}>Instance: {props.userRole.name}</li>

        <li className={styles.accounts}>
          <Url href={`${CONFIG.URL_ACCOUNTS}`}>My Accounts</Url>
        </li>
        <li>
          <Url
            title={`${CONFIG.URL_ACCOUNTS}/logout`}
            href={`${CONFIG.URL_ACCOUNTS}/logout`}
            className={cx(styles.link, styles.logout)}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </Url>
        </li>
      </menu>
    </section>
  );
});
