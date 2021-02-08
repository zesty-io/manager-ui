import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faExternalLinkAlt
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@zesty-io/core/Button";
import { Select, Option } from "@zesty-io/core/Select";
import { Url } from "@zesty-io/core/Url";

import { useDomain } from "shell/hooks/use-domain";

import styles from "./GlobalInstance.less";
export default connect(state => {
  return {
    instance: state.instance,
    instances: state.instances
  };
})(function GlobalInstance(props) {
  const ref = useRef();
  const domain = useDomain();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleGlobalClick = evt => {
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
    <section className={cx(styles.bodyText, styles.GlobalInstance)} ref={ref}>
      <menu className={styles.Actions}>
        {domain ? (
          <Url href={domain} target="_blank" title="Open production domain">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Url>
        ) : null}

        <button
          className={cx(styles.InstanceOpen)}
          onClick={evt => {
            // evt.stopPropagation();
            setOpen(!open);
          }}
        >
          {props.instance.name} <FontAwesomeIcon icon={faCaretDown} />
        </button>
      </menu>

      <main className={cx(styles.Instance, open ? null : styles.hide)}>
        <p className={cx(styles.bodyText, styles.zuid)}>
          ZUID: {props.instance.ZUID}
        </p>

        <Select name="instance" value={props.instance.ZUID}>
          {props.instances.map(instance => (
            <Option
              key={instance.ZUID}
              value={instance.ZUID}
              text={instance.name}
              onClick={() => {
                window.location.href = `${CONFIG.URL_MANAGER_PROTOCOL}${instance.ZUID}${CONFIG.URL_MANAGER}`;
              }}
            />
          ))}
        </Select>

        {props.instance.screenshotURL && (
          <img
            src={props.instance.screenshotURL}
            loading="lazy"
            width="356px"
            height="200px"
            alt="Instance Image"
          />
        )}

        <ul className={styles.Domains}>
          {props.instance.domains.map(domain => (
            <li key={domain.domain}>
              <Url
                title={`http://${domain.domain}`}
                href={`http://${domain.domain}`}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;
                {domain.domain}
              </Url>
            </li>
          ))}
          <Button kind="warn">
            <i className="fas fa-exclamation-circle"></i>
            Purge
          </Button>
        </ul>
      </main>
    </section>
  );
});
