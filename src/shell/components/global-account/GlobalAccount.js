import { useEffect, useRef, useState } from "react";

import { useSelector } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";

import { CopyButton } from "@zesty-io/material";
import { Url } from "@zesty-io/core/Url";
import Link from "@mui/material/Link";

import styles from "./GlobalAccount.less";
export default function GlobalAccount(props) {
  const user = useSelector((state) => state.user);
  const userRole = useSelector((state) => state.userRole);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  });
  return (
    <section className={styles.GlobalAccount} ref={ref}>
      <img
        data-cy="globalAccountAvatar"
        className={styles.Avatar}
        alt={`${user.firstName} ${user.lastName} Avatar`}
        src={`https://www.gravatar.com/avatar/${user.emailHash}?d=mm&s=40`}
        height="30px"
        width="30px"
        onClick={() => {
          setOpen(!open);
        }}
      />

      <menu
        className={cx(styles.bodyText, styles.Menu, open ? null : styles.hide)}
      >
        <li>
          {user.firstName} {user.lastName}
        </li>
        <li className={styles.email}>{user.email} </li>

        <li className={styles.zuid}>
          ZUID:&nbsp;
          <CopyButton size="small" value={user.ZUID} />
        </li>

        <li className={styles.role}>Instance: {userRole.name}</li>

        <li className={styles.accounts}>
          <Link
            href={`${CONFIG.URL_ACCOUNTS}`}
            underline="none"
            color="secondary"
          >
            My Accounts
          </Link>
        </li>
        <li>
          <Link
            underline="none"
            color="secondary"
            title={`${CONFIG.URL_ACCOUNTS}/logout`}
            href={`${CONFIG.URL_ACCOUNTS}/logout`}
            className={cx(styles.link, styles.logout)}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Logout
          </Link>
        </li>
      </menu>
    </section>
  );
}
