import React, { useState } from "react";
import { connect } from "react-redux";
import cx from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faBell,
  faExternalLinkSquareAlt,
  faQuestion
} from "@fortawesome/free-solid-svg-icons";
import { Url } from "@zesty-io/core/Url";

import GlobalAccountMenu from "./global-account-menu";

import styles from "./GlobalAccount.less";
export default connect(state => {
  return {
    instance: state.instance,
    instances: state.instances,
    user: state.user
  };
})(function GlobalAccount(props) {
  const [openMenu, setOpenMenu] = useState(false);
  const [token, setToken] = useState(false);

  return (
    <div className={styles.GlobalAccount}>
      {/* <div className={styles.Actions}>
        <FontAwesomeIcon icon={faEye} />
        <FontAwesomeIcon icon={faBell} />
        <FontAwesomeIcon icon={faQuestion} />
      </div> */}

      <div className={styles.InstanceLink}>
        {props.instance.domains.length ? (
          <Url
            href={`https://${props.instance.domains[0].domain}`}
            target="_blank"
          >
            {/* <FontAwesomeIcon icon={faExternalLinkSquareAlt} /> */}
            {props.instance.name}
          </Url>
        ) : (
          props.instance.name
        )}
      </div>

      <div
        className={styles.AccountMenu}
        onMouseEnter={() => {
          if (token) {
            clearTimeout(token);
          }
          setOpenMenu(true);
        }}
        onMouseLeave={() => {
          setToken(setTimeout(() => setOpenMenu(false), 500));
        }}
      >
        <img
          className={styles.Avatar}
          alt={`${props.user.firstName} ${props.user.lastName} Avatar`}
          src={`https://www.gravatar.com/avatar/${props.user.emailHash}?d=mm&s=40`}
          height="40px"
          width="40px"
        />
        <GlobalAccountMenu display={openMenu} />
      </div>
    </div>
  );
});
