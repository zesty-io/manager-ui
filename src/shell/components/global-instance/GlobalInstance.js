import { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { usePermission } from "shell/hooks/use-permissions";

import Link from "@mui/material/Link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import { CopyButton } from "@zesty-io/material";

import { request } from "utility/request";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faExternalLinkAlt,
  faEye,
} from "@fortawesome/free-solid-svg-icons";

import { Select, Option } from "@zesty-io/core/Select";

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
          <Link
            underline="none"
            color="secondary"
            href={domain}
            target="_blank"
            title="Open production domain"
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} />
          </Link>
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
        <Link
          underline="none"
          color="secondary"
          target="_blank"
          title={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`}
          href={`${CONFIG.URL_PREVIEW_PROTOCOL}${instance.randomHashID}${CONFIG.URL_PREVIEW}`}
        >
          <FontAwesomeIcon icon={faEye} />
          &nbsp;View WebEngine Preview
        </Link>
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
            <LoadingButton
              variant="contained"
              className={styles.Button}
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
              loading={purge}
              loadingPosition="start"
              startIcon={<ErrorOutlineIcon />}
            >
              Refresh Instance Cache
            </LoadingButton>
          </div>
        )}
        <ul className={styles.Domains}>
          {instance.domains.map((domain) => (
            <li key={domain.domain}>
              <Link
                underline="none"
                color="secondary"
                title={`http://${domain.domain}`}
                href={`http://${domain.domain}`}
                target="_blank"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                &nbsp;
                {domain.domain}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </section>
  );
}
