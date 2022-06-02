import { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { usePermission } from "shell/hooks/use-permissions";

import Button from "@mui/material/Button";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CircularProgress from "@mui/material/CircularProgress";

import { CopyButton } from "@zesty-io/material";

import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faExternalLinkAlt,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";
import { Url } from "@zesty-io/core/Url";

import { useDomain } from "shell/hooks/use-domain";
import { notify } from "shell/store/notifications";

import styles from "./GlobalInstance.less";

export default function GlobalInstance(props) {
  const dispatch = useDispatch();
  const instance = useSelector((state) => state.instance);
  const instances = useSelector((state) => state.instances);
  const ref = useRef();
  const domain = useDomain();
  const [open, setOpen] = useState(false);
  const [purge, setPurge] = useState(false);
  const canPurge = usePermission("PUBLISH");

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
    <section className={cx(styles.bodyText, styles.GlobalInstance)} ref={ref}>
      <menu className={styles.Actions}>
        {domain ? (
          <Url href={domain} target="_blank" title="Open production domain">
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Url>
        ) : null}

        <button
          className={cx(styles.InstanceOpen)}
          onClick={(evt) => {
            // evt.stopPropagation();
            setOpen(!open);
          }}
        >
          {instance.name} <FontAwesomeIcon icon={faCaretDown} />
        </button>
      </menu>

      <main className={cx(styles.Instance, open ? null : styles.hide)}>
        <p className={cx(styles.bodyText, styles.zuid)}>
          ZUID: <CopyButton size="small" value={instance.ZUID} />
        </p>

        <Select className={styles.Select} name="instance" value={instance.ZUID}>
          {instances.map((instance) => (
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
        <Url
          target="_blank"
          title={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`}
          href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`}
        >
          <FontAwesomeIcon icon={faEye} />
          &nbsp;View WebEngine Preview
        </Url>
        {instance.screenshotURL && (
          <img
            src={instance.screenshotURL}
            loading="lazy"
            width="356px"
            height="200px"
            alt="Instance Image"
          />
        )}

        {canPurge && (
          <div>
            <Button
              variant="contained"
              className={styles.Button}
              disabled={purge}
              onClick={() => {
                setPurge(true);
                return request(
                  `${CONFIG.CLOUD_FUNCTIONS_DOMAIN}/fastlyPurge?zuid=${instance.ZUID}&instance=${instance.ZUID}`
                )
                  .catch((err) => {
                    dispatch(
                      notify({
                        kind: "warn",
                        message: err.message,
                        err,
                      })
                    );
                  })
                  .finally(() => {
                    setPurge(false);
                  });
              }}
              startIcon={
                purge ? <CircularProgress size="20px" /> : <ErrorOutlineIcon />
              }
            >
              Refresh Instance Cache
            </Button>
          </div>
        )}
        <ul className={styles.Domains}>
          {instance.domains.map((domain) => (
            <li key={domain.domain}>
              <Url
                title={`http://${domain.domain}`}
                href={`http://${domain.domain}`}
                target="_blank"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;
                {domain.domain}
              </Url>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
}
